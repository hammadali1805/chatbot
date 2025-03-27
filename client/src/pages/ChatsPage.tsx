import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatWindow from '../components/chat/ChatWindow';

const ChatsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-sm m-6">
          <ChatWindow />
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatsPage; 