import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatWindow from '../components/chat/ChatWindow';

const ChatsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
          <ChatWindow />
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatsPage; 