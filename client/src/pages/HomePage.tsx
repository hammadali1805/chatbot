import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ChatWindow from '../components/chat/ChatWindow';

const HomePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <ChatWindow />
      </div>
    </MainLayout>
  );
};

export default HomePage; 