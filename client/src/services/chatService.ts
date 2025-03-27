import api from './api';

// Define the Message type
export interface Message {
  sender?: 'user' | 'bot';
  role?: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  _id?: string;
}

// Define the Chat type
export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
 
// Basic error handler to standardize error logging and error messages
const handleError = (operation: string, error: any): never => {
  console.error(`Error in chatService.${operation}:`, error);
  
  // Extract the most useful error message
  let errorMessage = 'Unknown error occurred';
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  throw new Error(`${operation} failed: ${errorMessage}`);
};

// Chat Service
export const chatService = {
  // Get all chats
  getAllChats: async (): Promise<Chat[]> => {
    try {
      console.log('Fetching all chats');
      const response = await api.get('/api/chats');
      return response.data;
    } catch (error) {
      return handleError('getAllChats', error);
    }
  },

  // Get a chat by ID
  getChatById: async (id: string): Promise<Chat> => {
    try {
      console.log(`Fetching chat with ID: ${id}`);
      const response = await api.get(`/api/chats/${id}`);
      return response.data;
    } catch (error) {
      return handleError('getChatById', error);
    }
  },

  // Create a new chat
  createChat: async (title: string = 'New Conversation'): Promise<Chat> => {
    try {
      console.log('Creating new chat');
      const response = await api.post('/api/chats', { title });
      return response.data;
    } catch (error) {
      return handleError('createChat', error);
    }
  },

  // Update a chat
  updateChat: async (id: string, chatData: Partial<Chat>): Promise<Chat> => {
    try {
      console.log(`Updating chat ${id}:`, chatData);
      const response = await api.put(`/api/chats/${id}`, chatData);
      console.log('Update chat response:', response.data);
      return response.data;
    } catch (error) {
      return handleError('updateChat', error);
    }
  },

  // Delete a chat
  deleteChat: async (chatId: string): Promise<void> => {
    try {
      console.log(`Deleting chat ${chatId}`);
      await api.delete(`/api/chats/${chatId}`);
    } catch (error) {
      handleError('deleteChat', error);
    }
  },

  // Add a message to a chat
  addMessage: async (chatId: string, content: string): Promise<Chat> => {
    try {
      console.log(`Adding message to chat ${chatId}`);
      const response = await api.post(`/api/chats/${chatId}/messages`, { 
        content,
        sender: 'user'
      });
      return response.data;
    } catch (error) {
      return handleError('addMessage', error);
    }
  }
}; 