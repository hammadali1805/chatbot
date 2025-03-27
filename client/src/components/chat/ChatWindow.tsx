import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import axios from 'axios';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
  isLoading?: boolean;
}

// Interfaces for API responses
interface ApiMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
  const { setCurrentChat, currentChat } = useAppContext();
  const { isAuthenticated } = useAuth();
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
      // If timestamp is undefined, use current date
      if (!timestamp) {
        return new Date().toISOString();
      }
      
      // If it's already a Date object, convert to ISO string
      if (timestamp instanceof Date) {
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid Date object:', timestamp);
          return new Date().toISOString();
        }
        return timestamp.toISOString();
      }
      
      // Otherwise, create a new Date from string and convert to ISO
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
        // If there's already a currentChat (selected from sidebar), use it
        if (currentChat) {
          console.log('Using current chat:', currentChat);
          const formattedMessages = currentChat.messages.map(msg => ({
            content: msg.content,
            isUser: msg.role === 'user',
            timestamp: formatTimestamp(msg.timestamp)
          }));
          
          console.log('Initial formatted messages:', formattedMessages);
          setMessages(formattedMessages);
          setActiveChatId(currentChat.id);
          
          // Check if this is a temporary chat (ID starts with 'temp-')
          const isTempId = typeof currentChat.id === 'string' && currentChat.id.startsWith('temp-');
          setIsTempChat(isTempId);
          
          setIsInitializing(false);
          return;
        }
        
        // Otherwise, show a temporary chat interface
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

      // Create a new chat in the database
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

      // Set active chat ID to the new chat's ID
      const newChatId = response.data._id;
      setActiveChatId(newChatId);
      setIsTempChat(false);
      
      // Update the app context with the new chat
      setCurrentChat({
        id: newChatId,
        title: response.data.title,
        createdAt: formatTimestamp(response.data.createdAt || new Date()),
        messages: response.data.messages.map(msg => ({
          id: msg._id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(formatTimestamp(msg.timestamp))
        }))
      });
      
      return newChatId;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create a new chat. Please try again.');
      return null;
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Add user message to UI immediately
      const now = new Date();
      const userMessage: Message = {
        content: content,
        isUser: true,
        timestamp: formatTimestamp(now)
      };
      
      // Add user message to UI immediately
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Add a loading message to indicate AI is thinking (optimistic UI)
      const loadingMessage: Message = {
        content: '...',
        isUser: false,
        timestamp: formatTimestamp(new Date()),
        isLoading: true
      };
      
      // Wait a tiny bit before showing the loading indicator so it feels responsive
      setTimeout(() => {
        if (isSubmitting) {
          setMessages(prevMessages => [...prevMessages, loadingMessage]);
        }
      }, 500);
      
      // Get token for API calls
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to send messages.');
        setIsSubmitting(false);
        return;
      }
      
      // If this is a temporary chat, create a new chat before sending message
      let chatId = activeChatId;
      if (isTempChat || !chatId) {
        try {
          // Create a new chat in the database without updating UI yet
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
          
          // Get the new chat ID but don't update UI state yet
          chatId = response.data._id;
          
        } catch (createError) {
          console.error('Error creating chat:', createError);
          setError('Failed to create a new chat. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Make API call to send message and get response
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
      console.log('Response messages:', response.data.messages);
      
      if (!response.data.messages || !Array.isArray(response.data.messages)) {
        console.error('Invalid messages array in response:', response.data);
        setError('Received invalid response from server. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Process all messages from the response
      const formattedMessages = response.data.messages.map((msg: ApiMessage) => {
        console.log('Processing message:', msg);
        return {
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: formatTimestamp(msg.timestamp)
        };
      });
      
      console.log('Formatted messages to display:', formattedMessages);
      
      // Now update all state at once to minimize renders
      setActiveChatId(chatId);
      setIsTempChat(false);
      setMessages(formattedMessages);
      
      // Update the current chat in the context with the new messages
      setCurrentChat({
        id: chatId,
        title: response.data.title,
        createdAt: formatTimestamp(response.data.createdAt || new Date()),
        messages: response.data.messages.map((msg: ApiMessage) => ({
          id: msg._id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(formatTimestamp(msg.timestamp))
        }))
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
      {/* Chat header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {isTempChat ? 'New Chat' : (currentChat?.title || 'Chat')}
        </h2>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Chat messages */}
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
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              isLoading={message.isLoading}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
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