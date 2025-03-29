import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import axios from 'axios';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    type: 'query' | 'quiz' | 'study_plan' | 'note' | null;
    referenceId?: string;
    action?: 'create' | 'update' | 'delete' | null;
  };
}

// Interfaces for API responses
interface ApiMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    type: 'query' | 'quiz' | 'study_plan' | 'note' | null;
    referenceId?: string;
    action?: 'create' | 'update' | 'delete' | null;
  };
}

interface ApiChat {
  _id: string;
  title: string;
  messages: ApiMessage[];
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatWindow: React.FC = () => {
  const { setCurrentChat, currentChat, addMessageToChat } = useAppContext();
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTempChat, setIsTempChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string | Date | undefined): string => {
    try {
      if (!timestamp) {
        return new Date().toISOString();
      }
      
      if (timestamp instanceof Date) {
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid Date object:', timestamp);
          return new Date().toISOString();
        }
        return timestamp.toISOString();
      }
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', timestamp);
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date().toISOString();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial chat or prepare a temporary chat interface
  useEffect(() => {
    const initializeChat = async () => {
      setIsInitializing(true);
      try {
        if (currentChat) {
          console.log('Using current chat:', currentChat);
          console.log('Chat messages metadata checks:', currentChat.messages.map(msg => ({
            has_metadata: !!msg.metadata,
            metadata_details: msg.metadata ? {
              type: msg.metadata.type,
              action: msg.metadata.action,
              referenceId: msg.metadata.referenceId
            } : null
          })));
          
          const formattedMessages = currentChat.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: formatTimestamp(msg.timestamp),
            metadata: msg.metadata
          }));
          
          console.log('Initial formatted messages:', formattedMessages);
          console.log('Formatted messages metadata present:', formattedMessages.filter(msg => !!msg.metadata).length);
          
          setMessages(formattedMessages);
          setActiveChatId(currentChat.id);
          
          const isTempId = typeof currentChat.id === 'string' && currentChat.id.startsWith('temp-');
          setIsTempChat(isTempId);
          
          setIsInitializing(false);
          return;
        }
        
        setIsTempChat(true);
        setMessages([]);
        setActiveChatId(null);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [currentChat]);

  const createNewChat = async (): Promise<string | null> => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await axios.post<ApiChat>(
        `${API_URL}/api/chats`,
        { title: 'New Conversation' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Created new chat, response:', response.data);

      const newChatId = response.data._id;
      setActiveChatId(newChatId);
      setIsTempChat(false);
      
      setCurrentChat({
        id: newChatId,
        title: response.data.title,
        createdAt: formatTimestamp(response.data.createdAt || new Date()),
        messages: response.data.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: formatTimestamp(msg.timestamp),
          metadata: msg.metadata
        }))
      });
      
      return newChatId;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create a new chat. Please try again.');
      return null;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Add user message to UI immediately
      const now = new Date();
      const userMessage: Message = {
        role: 'user',
        content: content,
        timestamp: formatTimestamp(now)
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Add a loading message
      const loadingMessage: Message = {
        role: 'assistant',
        content: '...',
        timestamp: formatTimestamp(new Date())
      };
      
      setTimeout(() => {
        if (isSubmitting) {
          setMessages(prevMessages => [...prevMessages, loadingMessage]);
        }
      }, 500);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to send messages.');
        setIsSubmitting(false);
        return;
      }
      
      let chatId = activeChatId;
      if (isTempChat || !chatId) {
        try {
          const response = await axios.post<ApiChat>(
            `${API_URL}/api/chats`,
            { title: 'New Conversation' },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Created new chat, response:', response.data);
          chatId = response.data._id;
          
        } catch (createError) {
          console.error('Error creating chat:', createError);
          setError('Failed to create a new chat. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      const response = await axios.post<ApiChat>(
        `${API_URL}/api/chats/${chatId}/messages`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Message sent, complete API response:', response.data);
      console.log('API response messages metadata:', response.data.messages.map(msg => 
        msg.metadata ? JSON.stringify(msg.metadata) : 'null'
      ));
      
      if (!response.data.messages || !Array.isArray(response.data.messages)) {
        console.error('Invalid messages array in response:', response.data);
        setError('Received invalid response from server. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      const formattedMessages = response.data.messages.map((msg: ApiMessage) => ({
        role: msg.role,
        content: msg.content,
        timestamp: formatTimestamp(msg.timestamp),
        metadata: msg.metadata
      }));
      
      console.log('Formatted messages to display:', formattedMessages);
      
      setActiveChatId(chatId);
      setIsTempChat(false);
      setMessages(formattedMessages);
      
      setCurrentChat({
        id: chatId,
        title: response.data.title,
        createdAt: formatTimestamp(response.data.createdAt || new Date()),
        messages: formattedMessages
      });
    } catch (err: any) {
      console.error('Error sending message:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
      }
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {isTempChat ? 'New Chat' : (currentChat?.title || 'Chat')}
        </h2>
      </div>
      
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isInitializing ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-xl font-medium mb-2">How can I help you today?</p>
            <p className="text-sm">Ask me anything about your studies</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <ChatInput 
          onSendMessage={handleSendMessage}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ChatWindow; 