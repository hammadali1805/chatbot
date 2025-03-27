import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4">
          <h2 className="text-xl font-bold">Student Chatbot</h2>
        </div>
        
        <nav className="mt-4">
          <Link
            to="/"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 ${
              isActive('/') ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="mr-2">💬</span>
            Chat
          </Link>
          
          <Link
            to="/study-plans"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 ${
              isActive('/study-plans') ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="mr-2">📚</span>
            Study Plans
          </Link>
          
          <Link
            to="/quizzes"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 ${
              isActive('/quizzes') ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="mr-2">✍️</span>
            Quizzes
          </Link>
          
          <Link
            to="/notes"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 ${
              isActive('/notes') ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="mr-2">📝</span>
            Notes
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-50">
        <main className="h-full">{children}</main>
      </div>
    </div>
  );
}; 