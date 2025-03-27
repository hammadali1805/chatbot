import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import axios from 'axios';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  sender?: string;
  _doc?: {
    role: string;
    content: string;
    timestamp: string;
    _id: string;
  };
}

interface ChatResponse {
  _id: string;
  messages: ChatMessage[];
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm here to help you with your studies. How can I assist you today?",
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create a new chat if we don't have one
  useEffect(() => {
    const createNewChat = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.post<ChatResponse>(
          `${API_URL}/api/chats`,
          { title: 'New Conversation' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setChatId(response.data._id);
        
        // Update messages from the server response
        if (response.data.messages && response.data.messages.length > 0) {
          const formattedMessages = response.data.messages.map(msg => {
            // Extract data from Mongoose document
            const messageData = msg._doc || msg;
            return {
              content: messageData.content,
              isUser: messageData.role === 'user',
              timestamp: messageData.timestamp
            };
          });
          
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error('Error creating chat:', err);
        setError('Failed to create a new chat. Please try again.');
      }
    };

    if (!chatId) {
      createNewChat();
    }
  }, [chatId]);

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSubmitting || !chatId) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Add user message to UI immediately
      const userMessage: Message = {
        content: content,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Send message to API
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to send messages.');
        return;
      }

      const response = await axios.post<ChatResponse>(
        `${API_URL}/api/chats/${chatId}/messages`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Response:', response.data);
      // Get the bot response from the API
      const messages = response.data.messages;
      if (messages && messages.length > 0) {
        // The last message should be the bot's response
        const latestBotMessage = messages[messages.length - 1];
        // Extract data from the Mongoose document structure
        const messageData = latestBotMessage._doc || latestBotMessage;
        
        if (messageData.role === 'assistant') {
          const botResponse: Message = {
            content: messageData.content,
            isUser: false,
            timestamp: messageData.timestamp
          };
          
          console.log('Bot response:', botResponse);
          setMessages(prevMessages => [...prevMessages, botResponse]);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
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