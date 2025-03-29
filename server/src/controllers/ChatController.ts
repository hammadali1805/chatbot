import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Chat } from '../models/Chat';
import { Quiz } from '../models/Quiz';
import { StudyPlan } from '../models/StudyPlan';
import { Note } from '../models/Note';
import { processChat } from '../utils/unifiedChatProcessor';
import { Types } from 'mongoose';

type IntentType = 'query' | 'quiz' | 'study_plan' | 'note';
type ActionType = 'create' | 'update' | 'delete' | null;
type DocumentType = Exclude<IntentType, 'query'>;

// Define interfaces for cleaner typing
interface IMessageMetadata {
  type: IntentType | null;
  action: ActionType;
  referenceId?: Types.ObjectId;
}

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: IMessageMetadata;
}

interface ChatMessage extends Omit<IMessage, 'timestamp'> {
  _id?: any;
  timestamp: Date | string;
}

interface ActiveItem {
  type: DocumentType;
  id: Types.ObjectId;
}

interface ChatDocument {
  _id: any;
  userId: string;
  title: string;
  messages: ChatMessage[];
  context?: {
    currentTopic?: string;
    currentSubject?: string;
    activeItems: ActiveItem[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ChatController extends BaseController {
  constructor() {
    super(Chat, 'Chat');
  }

  // Add message to chat
  addMessage = async (req: Request, res: Response) => {
    try {
      console.log("Received message request:", req.body);
      
      const userId = req.user?.id;
      const chatId = req.params.id;
      const { content } = req.body;
      
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Message content is required' });
      }
      
      console.log(`Processing message for User ID: ${userId}, Chat ID: ${chatId}`);

      // Find the chat
      const chat = await Chat.findOne({ _id: chatId, userId });

      if (!chat) {
        console.log("Chat not found");
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Initialize context if it doesn't exist
      if (!chat.context) {
        chat.context = {
          activeItems: []
        };
      } else if (!chat.context.activeItems) {
        chat.context.activeItems = [];
      }

      // Add user message to the chat
      const now = new Date();
      const userMessage = {
        role: 'user' as const,
        content,
        timestamp: now
      };
      chat.messages.push(userMessage);

      // Get message history for context
      const messageHistory = chat.messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Process the message with unified processor
      const response = await processChat(content, chat.context || {}, messageHistory);
      
      let createdItem: any = null;

      // Handle document creation or update
      if (response.document) {
        try {
          // Check if this is an update operation
          if (response.intent.action === 'update' && chat.context.activeItems && chat.context.activeItems.length > 0) {
            // Find the most recent active item of the same type
            const itemToUpdate = chat.context.activeItems.find(item => 
              item.type === response.intent.type
            );
            
            if (itemToUpdate) {
              console.log(`Updating existing ${response.intent.type} with ID: ${itemToUpdate.id}`);
              
              // Update the document based on type
              if (response.intent.type === 'quiz' && response.document.quiz) {
                createdItem = await Quiz.findByIdAndUpdate(
                  itemToUpdate.id,
                  { 
                    ...response.document.quiz,
                    user: userId 
                  },
                  { new: true, runValidators: true }
                );
              } else if (response.intent.type === 'study_plan' && response.document.studyPlan) {
                createdItem = await StudyPlan.findByIdAndUpdate(
                  itemToUpdate.id,
                  { 
                    ...response.document.studyPlan,
                    user: userId 
                  },
                  { new: true, runValidators: true }
                );
              } else if (response.intent.type === 'note' && response.document.note) {
                createdItem = await Note.findByIdAndUpdate(
                  itemToUpdate.id,
                  { 
                    ...response.document.note,
                    user: userId 
                  },
                  { new: true, runValidators: true }
                );
              }
              
              console.log(`Updated ${response.intent.type} document:`, createdItem?._id?.toString());
            } else {
              console.log(`No active ${response.intent.type} found to update, creating new`);
              // Fall back to creation path
              createdItem = await this.createDocument(response, userId);
            }
          } else {
            // Create new document
            createdItem = await this.createDocument(response, userId);
          }
          
          console.log("Document operation successful, ID:", createdItem?._id?.toString());
        } catch (docError) {
          console.error('Error handling document:', docError);
          // Continue with chat response even if document handling fails
        }
      }

      // Add AI response to chat with proper metadata
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.message.content,
        timestamp: new Date(),
        metadata: undefined as IMessageMetadata | undefined
      };
      
      // Only add metadata if we have a non-query intent and a created document
      if (response.intent.type !== 'query' && createdItem?._id) {
        assistantMessage.metadata = {
          type: response.intent.type,
          action: response.intent.action || 'create',
          referenceId: new Types.ObjectId(createdItem._id.toString())
        };
        console.log("Adding message with metadata:", JSON.stringify(assistantMessage.metadata, (key, value) => {
          if (key === 'referenceId' && value) return value.toString();
          return value;
        }));
      } else {
        console.log("No metadata added to assistant message");
      }
      
      chat.messages.push(assistantMessage);

      // Update chat context - handle case where no createdItem but we need to preserve existing items
      const updatedContext: {
        currentTopic?: string;
        currentSubject?: string;
        activeItems?: ActiveItem[];
      } = {
        currentTopic: response.intent.topic || chat.context?.currentTopic,
        currentSubject: response.intent.subject || chat.context?.currentSubject,
      };

      // Only add activeItems if we have them to prevent Mongoose from adding extra fields
      if (createdItem?._id) {
        updatedContext.activeItems = this.updateActiveItems(
          chat.context?.activeItems || [],
          response.intent,
          createdItem
        );
      } else if (chat.context?.activeItems) {
        // Keep existing active items
        updatedContext.activeItems = chat.context.activeItems;
      } else {
        // Initialize empty array
        updatedContext.activeItems = [];
      }

      // Update the chat context
      chat.context = updatedContext;

      // Update chat title for new chats
      if (chat.messages.length <= 3 && chat.title === 'New Conversation') {
        const titleWords = content.split(' ').slice(0, 5);
        chat.title = titleWords.join(' ') + (titleWords.length >= 5 ? '...' : '');
      }

      // Try to save with error handling
      try {
        console.log("Saving chat with context:", JSON.stringify(chat.context));
        await chat.save();
        console.log("Chat saved successfully");
      } catch (saveError: any) {
        console.error("Chat save error details:", saveError);
        if (saveError.name === 'ValidationError') {
          // Try to save without activeItems as fallback
          chat.context.activeItems = [];
          await chat.save();
          console.log("Chat saved with empty activeItems as fallback");
        } else {
          throw saveError;
        }
      }
      
      // Format the response with explicit metadata
      const chatObject = chat.toObject() as ChatDocument;
      const formattedMessages = chatObject.messages.map((msg: ChatMessage) => {
        // Properly format the metadata for the frontend
        let formattedMetadata = null;
        if (msg.metadata) {
          formattedMetadata = {
            type: msg.metadata.type,
            action: msg.metadata.action,
            // Convert ObjectId to string for frontend
            referenceId: msg.metadata.referenceId ? msg.metadata.referenceId.toString() : undefined
          };
        }
        
        return {
          ...msg,
          _id: msg._id || new Date().getTime().toString(),
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
          metadata: formattedMetadata // Use formatted metadata
        };
      });
      
      const responseData = {
        ...chatObject,
        messages: formattedMessages
      };
      
      res.json(responseData);
    } catch (error: any) {
      console.error('Error adding message:', error);
      res.status(500).json({ 
        message: `Error adding message: ${error.message}` 
      });
    }
  };

  // Helper method to create a document
  private async createDocument(response: any, userId: string) {
    let createdItem: any = null;
    if (response.document.quiz) {
      createdItem = await Quiz.create({
        user: userId,
        ...response.document.quiz
      });
    } else if (response.document.studyPlan) {
      createdItem = await StudyPlan.create({
        user: userId,
        ...response.document.studyPlan
      });
    } else if (response.document.note) {
      createdItem = await Note.create({
        user: userId,
        ...response.document.note
      });
    }
    console.log("Created document with ID:", createdItem?._id?.toString());
    return createdItem;
  }

  private updateActiveItems(
    currentItems: ActiveItem[],
    intent: { type: IntentType; action: ActionType },
    createdItem: any
  ): ActiveItem[] {
    const MAX_ACTIVE_ITEMS = 5;
    let items = [...currentItems];

    // Log current items and their IDs for debugging
    console.log("Current activeItems:", JSON.stringify(currentItems));

    // Ensure existing items have valid ObjectIds
    items = items.map(item => {
      // Check if ID is valid
      if (item.id) {
        try {
          // Just pass the id string or convert to string if it's an ObjectId
          return {
            type: item.type,
            id: typeof item.id === 'string' ? new Types.ObjectId(item.id) : item.id
          };
        } catch (error) {
          console.error("Invalid existing ObjectId:", item.id);
          // Filter out invalid IDs to prevent errors
          return null;
        }
      }
      return null;
    }).filter(item => item !== null) as ActiveItem[];

    if (intent.action === 'create' && createdItem?._id && intent.type !== 'query') {
      // Remove older items of the same type if we have too many
      const sameTypeItems = items.filter(item => item.type === intent.type);
      if (sameTypeItems.length >= MAX_ACTIVE_ITEMS) {
        const itemsToRemove = sameTypeItems.length - MAX_ACTIVE_ITEMS + 1;
        items = items.filter(item => 
          item.type !== intent.type || 
          sameTypeItems.indexOf(item) >= itemsToRemove
        );
      }

      try {
        // For consistency with schema, store as plain Objects with clean string properties
        // Get the string ID but don't convert to ObjectId here
        const idString = createdItem._id.toString();
        console.log("Using document ID:", idString);
        
        // Add new item with proper ID
        items.push({
          type: intent.type as DocumentType,
          id: createdItem._id // Pass the ObjectId directly
        });
        console.log("Added item with ID:", idString);
      } catch (error) {
        console.error("Error creating item:", error);
      }
    } else if (intent.action === 'delete' && createdItem?._id) {
      try {
        // Get the clean string ID
        const idString = createdItem._id.toString();
        
        // Remove the item by ID
        items = items.filter(item => item.id.toString() !== idString);
        console.log("Removed item with ID:", idString);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }

    // Log the final items for debugging
    console.log("Final activeItems:", JSON.stringify(items.map(item => ({
      type: item.type,
      id: typeof item.id === 'object' ? item.id.toString() : item.id
    }))));

    return items;
  }

  // Override the getAll method to ensure consistent formatting
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Fetching all chats for user");
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
      console.log(`Found ${chats.length} chats for user ${userId}`);
      
      // Format chats in a way the frontend expects
      const formattedChats = chats.map(chat => {
        const chatObject = chat.toObject() as ChatDocument;
        
        // Format messages
        const formattedMessages = chatObject.messages.map((msg: ChatMessage) => {
          // Properly format the metadata for the frontend
          let formattedMetadata = null;
          if (msg.metadata) {
            formattedMetadata = {
              type: msg.metadata.type,
              action: msg.metadata.action,
              // Convert ObjectId to string for frontend
              referenceId: msg.metadata.referenceId ? msg.metadata.referenceId.toString() : undefined
            };
          }
          
          return {
            ...msg,
            _id: msg._id || new Date().getTime().toString(),
            timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
            metadata: formattedMetadata // Use formatted metadata
          };
        });
        
        return {
          ...chatObject,
          messages: formattedMessages
        };
      });
      
      res.json(formattedChats);
    } catch (error: any) {
      console.error(`Error getting all chats:`, error);
      res.status(500).json({ message: `Error getting all chats: ${error.message}` });
    }
  };
  
  // Override the getOne method to ensure consistent formatting
  getOne = async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      console.log(`Fetching chat with ID: ${req.params.id}`);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const chat = await this.model.findOne({ _id: req.params.id, userId });
      
      if (!chat) {
        console.log(`Chat with ID ${req.params.id} not found for user ${userId}`);
        return res.status(404).json({ message: `Chat not found` });
      }
      
      console.log(`Found chat with ${chat.messages.length} messages`);
      
      // Convert the Mongoose document to a plain object
      const chatObject = chat.toObject() as ChatDocument;
      
      // Format messages in a way the frontend expects
      const formattedMessages = chatObject.messages.map((msg: ChatMessage) => {
        // Properly format the metadata for the frontend
        let formattedMetadata = null;
        if (msg.metadata) {
          formattedMetadata = {
            type: msg.metadata.type,
            action: msg.metadata.action,
            // Convert ObjectId to string for frontend
            referenceId: msg.metadata.referenceId ? msg.metadata.referenceId.toString() : undefined
          };
        }
        
        return {
          ...msg,
          _id: msg._id || new Date().getTime().toString(),
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
          metadata: formattedMetadata // Use formatted metadata
        };
      });
      
      // Create the response object
      const responseData = {
        ...chatObject,
        messages: formattedMessages
      };
      
      return res.json(responseData);
    } catch (error: any) {
      console.error(`Error getting chat:`, error);
      return res.status(500).json({ message: `Error getting chat: ${error.message}` });
    }
  };

  // Create a new chat
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Creating new chat");
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const now = new Date();
      
      // Create a new chat with no initial welcome message
      const newChat = new Chat({
        userId,
        title: req.body.title || 'New Conversation',
        messages: [], // Empty messages array - no welcome message
        context: {
          activeItems: []
        },
        createdAt: now,
        updatedAt: now
      });
      
      await newChat.save();
      console.log(`Created new chat with ID: ${newChat._id}`);
      
      // Convert to plain object and format for the frontend
      const chatObject = newChat.toObject() as ChatDocument;
      
      // Format messages
      const formattedMessages = chatObject.messages.map((msg: ChatMessage) => {
        // Properly format the metadata for the frontend
        let formattedMetadata = null;
        if (msg.metadata) {
          formattedMetadata = {
            type: msg.metadata.type,
            action: msg.metadata.action,
            // Convert ObjectId to string for frontend
            referenceId: msg.metadata.referenceId ? msg.metadata.referenceId.toString() : undefined
          };
        }
        
        return {
          ...msg,
          _id: msg._id || new Date().getTime().toString(),
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
          metadata: formattedMetadata // Use formatted metadata
        };
      });
      
      const responseData = {
        ...chatObject,
        messages: formattedMessages
      };
      
      res.status(201).json(responseData);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      res.status(500).json({ message: `Error creating chat: ${error.message}` });
    }
  };
} 