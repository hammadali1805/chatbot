import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    type: 'query' | 'quiz' | 'study_plan' | 'note' | null;
    referenceId?: string;
    action?: 'create' | 'update' | 'delete' | null;
  };
}

interface ChatMessageProps {
  message: Message;
}

const DocumentNavButton: React.FC<{
  type: string;
  id: string;
  action: 'create' | 'update';
}> = ({ type, id, action }) => {
  const navigate = useNavigate();
  
  // Skip rendering if id is empty
  if (!id) {
    console.error('DocumentNavButton received empty id for type:', type);
    return null;
  }
  
  const getRoute = () => {
    switch (type) {
      case 'quiz':
        return '/quizzes';
      case 'study_plan':
        return '/study-plans';
      case 'note':
        return '/notes';
      default:
        return '/';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'quiz':
        return '📝';
      case 'study_plan':
        return '📚';
      case 'note':
        return '📓';
      default:
        return '📄';
    }
  };

  const getLabel = () => {
    const typeLabel = type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `${action === 'create' ? 'View' : 'Open'} ${typeLabel}`;
  };

  const handleNavigate = () => {
    const route = `${getRoute()}/${id}`;
    console.log(`Attempting navigation to: ${route} for ${type} with id: ${id}`);
    
    // Log navigation details to the console in a more visible way
    console.log('%c NAVIGATION', 'background: green; color: white; padding: 2px 5px; border-radius: 2px;');
    console.log('→ Route:', route);
    console.log('→ Document Type:', type);
    console.log('→ Document ID:', id);
    
    // Add a more visible notification for debugging
    const notification = document.createElement('div');
    notification.textContent = `Navigating to document: ${type} (${id})`;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
    
    // Use window.location for direct navigation
    window.location.href = route;
  };

  return (
    <button
      onClick={handleNavigate}
      className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      <span className="text-lg">{getIcon()}</span>
      {getLabel()}
    </button>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  // Enhanced debug logging
  console.log(`Message (${isUser ? 'user' : 'assistant'}):`);
  console.log('- Content:', message.content.substring(0, 30) + (message.content.length > 30 ? '...' : ''));
  console.log('- Has metadata:', !!message.metadata);
  
  if (message.metadata) {
    console.log('- Metadata details:', {
      type: message.metadata.type,
      action: message.metadata.action,
      referenceId: message.metadata.referenceId
    });
  }
  
  // Check if we have valid metadata for document navigation
  const hasValidMetadata = Boolean(
    message.metadata && 
    message.metadata.type && 
    message.metadata.type !== 'query' && 
    message.metadata.referenceId && 
    (message.metadata.action === 'create' || message.metadata.action === 'update')
  );
  
  console.log('- Should show navigation:', hasValidMetadata);
  
  const getMessageStyle = () => {
    if (message.metadata?.type) {
      switch (message.metadata.type) {
        case 'quiz':
          return 'bg-blue-50 border-blue-200';
        case 'study_plan':
          return 'bg-green-50 border-green-200';
        case 'note':
          return 'bg-purple-50 border-purple-200';
        default:
          return isUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200';
      }
    }
    return isUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200';
  };

  const getMessageIcon = () => {
    if (message.metadata?.type) {
      switch (message.metadata.type) {
        case 'quiz':
          return '📝';
        case 'study_plan':
          return '📚';
        case 'note':
          return '📓';
        default:
          return isUser ? '👤' : '🤖';
      }
    }
    return isUser ? '👤' : '🤖';
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-lg">{getMessageIcon()}</span>
          </div>
        </div>
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-lg px-4 py-2 ${getMessageStyle()} border`}>
            <div className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</div>
            {message.metadata?.type && message.metadata.type !== 'query' && (
              <div className="mt-2 text-xs text-gray-500">
                {message.metadata.action === 'create' && 'Created new '}
                {message.metadata.action === 'update' && 'Updated '}
                {message.metadata.action === 'delete' && 'Deleted '}
                {message.metadata.type.replace('_', ' ')}
              </div>
            )}
            {hasValidMetadata && message.metadata && (
              <>
                <div className="text-xs text-blue-500 mt-1 mb-1">
                  Document ID: {message.metadata.referenceId}
                </div>
                <DocumentNavButton
                  type={message.metadata.type as string}
                  id={message.metadata.referenceId || ''}
                  action={message.metadata.action as 'create' | 'update'}
                />
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">{formattedTime}</div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 