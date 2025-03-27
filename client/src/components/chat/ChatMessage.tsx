import React from 'react';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser, timestamp }) => {
  return (
    <div className={`p-3 rounded-lg max-w-3/4 ${
      isUser 
        ? 'ml-auto bg-blue-100 text-blue-800' 
        : 'mr-auto bg-gray-100 text-gray-800'
    }`}>
      <p className="whitespace-pre-wrap">{content}</p>
      {timestamp && (
        <span className="text-xs text-gray-500 mt-1 block">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ChatMessage; 