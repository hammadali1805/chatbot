import React from 'react';

interface Chat {
  _id: string;
  title: string;
  updatedAt: string;
}

interface ChatListProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  isLoading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  activeChatId, 
  onSelectChat,
  isLoading 
}) => {
  // Format date to relative time (e.g. "2 days ago")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Check if it's today
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // Format as MM/DD/YYYY
      return date.toLocaleDateString();
    }
  };

  if (isLoading && chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-gray-500">Loading chats...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500">No chats yet</p>
        <p className="text-gray-400 text-sm">Start a new conversation</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-full">
      {chats.map(chat => (
        <div
          key={chat._id}
          className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
            activeChatId === chat._id ? 'bg-blue-50' : ''
          }`}
          onClick={() => onSelectChat(chat._id)}
        >
          <div className="font-medium text-gray-800 truncate">{chat.title}</div>
          <div className="text-xs text-gray-500">
            {chat.updatedAt ? formatDate(chat.updatedAt) : 'New'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList; 