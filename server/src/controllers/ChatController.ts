import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Chat } from '../models/Chat';
import { getAzureChatResponse } from '../utils/azureOpenai';

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

      // Add user message to the chat
      const now = new Date();
      chat.messages.push({
        role: 'user',
        content,
        timestamp: now
      });
      
      // Update lastActive timestamp
      chat.updatedAt = now;

      // Prepare the conversation history for Azure OpenAI
      // Convert Mongoose model format to simple objects
      const messageHistory = chat.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant', 
        content: msg.content
      }));
      
      // Add a system message at the beginning
      messageHistory.unshift({
        role: 'system',
        content: 'You are an AI study assistant that helps students with their academic questions. Provide helpful, educational responses. Be concise but thorough in your explanations.'
      });

      try {
        // Generate AI response using Azure OpenAI
        console.log("Calling Azure OpenAI...");
        const aiResponse = await getAzureChatResponse(messageHistory);
        console.log("Received Azure OpenAI response:", aiResponse.substring(0, 100));
        
        // Add AI response to the chat
        chat.messages.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        });
      } catch (aiError) {
        console.error("Azure OpenAI error:", aiError);
        // Fallback to a simple response if the AI call fails
        chat.messages.push({
          role: 'assistant',
          content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again later.",
          timestamp: new Date()
        });
      }

      // Update chat title for new chats
      if (chat.messages.length <= 3 && chat.title === 'New Conversation') {
        const firstMsg = content;
        const titleWords = firstMsg.split(' ').slice(0, 5);
        const titleText = titleWords.join(' ');
        
        chat.title = titleText + (titleWords.length >= 5 ? '...' : '');
      }

      // Save the chat with both user message and AI response
      await chat.save();
      
      // Transform the response to include sender property expected by the client
      const transformedChat = {
        ...chat.toObject(),
        messages: chat.messages.map(msg => ({
          ...msg,
          sender: msg.role === 'user' ? 'user' : 'bot'
        }))
      };
      
      console.log("Sending complete response back to client");
      res.json(transformedChat);
    } catch (error: any) {
      console.error('Error adding message:', error);
      res.status(500).json({ 
        message: `Error adding message: ${error.message}` 
      });
    }
  };

  // Override the getAll method to add sender property for client
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
      
      const transformedChats = chats.map(chat => ({
        ...chat.toObject(),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          sender: msg.role === 'user' ? 'user' : 'bot'
        }))
      }));
      
      res.json(transformedChats);
    } catch (error: any) {
      console.error(`Error getting all chats:`, error);
      res.status(500).json({ message: `Error getting all chats: ${error.message}` });
    }
  };
  
  // Override the getOne method to add sender property for client
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
      
      const transformedChat = {
        ...chat.toObject(),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          sender: msg.role === 'user' ? 'user' : 'bot'
        }))
      };
      
      return res.json(transformedChat);
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
      
      // Create a new chat with initial welcome message
      const newChat = new Chat({
        userId,
        title: req.body.title || 'New Conversation',
        messages: [{
          role: 'assistant',
          content: 'Hello! I\'m your AI study assistant. How can I help you today?',
          timestamp: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newChat.save();
      console.log(`Created new chat with ID: ${newChat._id}`);
      
      const transformedChat = {
        ...newChat.toObject(),
        messages: newChat.messages.map((msg: any) => ({
          ...msg,
          sender: msg.role === 'user' ? 'user' : 'bot'
        }))
      };
      
      res.status(201).json(transformedChat);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      res.status(500).json({ message: `Error creating chat: ${error.message}` });
    }
  };
} 