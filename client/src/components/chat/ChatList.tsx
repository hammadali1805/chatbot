import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatService, Chat } from '../../services/chatService';
import { Button } from '../ui/button';

export const ChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const loadedChats = await chatService.getAllChats();
        setChats(loadedChats);
      } catch (err) {
        console.error('Error loading chats:', err);
        setError('Failed to load chats');
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  const handleCreateChat = async () => {
    try {
      setIsLoading(true);
      const newChat = await chatService.createChat('New Conversation');
      setChats(prevChats => [newChat, ...prevChats]);
      navigate(`/chat/${newChat._id}`);
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await chatService.deleteChat(chatId);
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat');
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col h-full">
      <Button
        onClick={handleCreateChat}
        disabled={isLoading}
        className="mb-4 w-full"
      >
        New Chat
      </Button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading && !chats.length ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          chats.map((chat) => (
            <Link
              key={chat._id}
              to={`/chat/${chat._id}`}
              className="block p-2 hover:bg-gray-200 rounded-lg relative group"
            >
              <div className="truncate pr-8">{chat.title}</div>
              <button
                onClick={(e) => handleDeleteChat(chat._id, e)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}; 