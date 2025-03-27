import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, FileQuestion, FileText, LogOut, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import axios from 'axios';

// API interfaces
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

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { chats, addChat, setCurrentChat, currentChat } = useAppContext();
  const { user, logout } = useAuth();
  const [apiChats, setApiChats] = useState<ApiChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chats whenever the sidebar mounts or currentChat changes
  useEffect(() => {
    fetchChats();
  }, [currentChat]); // Re-fetch when currentChat changes

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get<ApiChat[]>(
        `${API_URL}/api/chats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setApiChats(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setIsLoading(false);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

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

      console.log('Created new chat:', response.data);

      // Add to local state immediately
      setApiChats(prev => [response.data, ...prev]);
      
      // Update current chat in context
      setCurrentChat({
        id: response.data._id,
        title: response.data.title,
        createdAt: response.data.createdAt || new Date().toISOString(),
        messages: response.data.messages.map(msg => ({
          id: msg._id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }))
      });
      
      // Navigate to the chat page
      navigate('/');
      
      setIsLoading(false);
      
      // Re-fetch chats to ensure the list is updated
      fetchChats();
    } catch (error) {
      console.error('Error creating new chat:', error);
      setIsLoading(false);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get<ApiChat>(
        `${API_URL}/api/chats/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Selected chat data:', response.data);

      // Update current chat in context
      setCurrentChat({
        id: response.data._id,
        title: response.data.title,
        createdAt: response.data.createdAt || new Date().toISOString(),
        messages: response.data.messages.map(msg => ({
          id: msg._id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }))
      });
      
      // Navigate to the chat page
      navigate('/');
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Today';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Today';
    }
  };

  const handleChatNavClick = (e: React.MouseEvent) => {
    // Create a temporary chat in the context
    const tempChat = {
      id: 'temp-' + Date.now(),
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    // Set as current chat
    setCurrentChat(tempChat);
    
    // Navigate to the chat page
    navigate('/');
  };

  return (
    <div className="bg-white text-gray-800 h-screen w-64 flex flex-col border-r border-gray-200">
      {/* App Title and User Info */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">ChatBot Kaksha</h1>
        {user && (
          <div className="mt-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          <li>
            <Link 
              to="/" 
              onClick={handleChatNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                isActive('/') && !isActive('/study-plans') && !isActive('/quizzes') && !isActive('/notes') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare size={20} /> Chat
            </Link>
          </li>
          <li>
            <Link 
              to="/study-plans" 
              className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                isActive('/study-plans') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={20} /> Study Plans
            </Link>
          </li>
          <li>
            <Link 
              to="/quizzes" 
              className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                isActive('/quizzes') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileQuestion size={20} /> Quizzes
            </Link>
          </li>
          <li>
            <Link 
              to="/notes" 
              className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                isActive('/notes') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} /> Notes
            </Link>
          </li>
        </ul>

        {/* Chat History */}
        <div className="px-4 py-2 mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Chat History</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ul className="space-y-1">
              {apiChats.length === 0 ? (
                <li className="text-sm text-gray-500 py-1 px-4">No chat history yet</li>
              ) : (
                apiChats.map((chat) => (
                  <li key={chat._id}>
                    <button
                      onClick={() => handleSelectChat(chat._id)}
                      className={`w-full flex flex-col px-4 py-2 text-sm rounded-md text-left hover:bg-gray-100 transition-colors ${
                        currentChat && currentChat.id === chat._id ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span className="font-medium truncate">{chat.title}</span>
                      <span className="text-xs text-gray-500">{formatDate(chat.updatedAt || chat.createdAt || '')}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 