import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, BookOpen, FileQuestion, FileText, LogOut, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { chats } = useAppContext();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
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
          <ul className="space-y-1">
            {chats.map((chat) => (
              <li key={chat.id}>
                <Link
                  to={`/chat/${chat.id}`}
                  className={`flex flex-col px-4 py-2 text-sm rounded-md ${
                    isActive(`/chat/${chat.id}`) 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{chat.title}</span>
                  <span className="text-xs text-gray-500">{chat.createdAt}</span>
                </Link>
              </li>
            ))}
          </ul>
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