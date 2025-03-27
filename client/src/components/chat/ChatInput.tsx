import React, { useState } from 'react';
import { Button } from '../ui/button';
import { SendIcon, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSubmitting?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSubmitting = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isSubmitting) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-2 bg-white rounded-lg border border-gray-200 p-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 max-h-32 min-h-[40px] resize-none border-0 focus:ring-0 focus:outline-none p-2 bg-transparent"
          disabled={isSubmitting}
          rows={1}
        />
        
        <Button 
          type="submit"
          variant="default"
          size="icon"
          className="rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
          disabled={!message.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <SendIcon size={18} />
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput; 