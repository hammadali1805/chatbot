import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  content, 
  isUser, 
  timestamp,
  isLoading = false
}) => {
  const markdownRef = useRef<HTMLDivElement>(null);

  // Apply syntax highlighting when component mounts or updates
  useEffect(() => {
    if (!isUser && !isLoading && markdownRef.current) {
      // Small delay to make sure the DOM is fully rendered
      setTimeout(() => {
        // Initialize Prism
        if (Prism && typeof Prism.highlightAll === 'function') {
          Prism.highlightAll();
        }
        
        // Also try to highlight under the specific element
        if (markdownRef.current && typeof Prism.highlightAllUnder === 'function') {
          Prism.highlightAllUnder(markdownRef.current);
        }
      }, 10);
    }
  }, [content, isUser, isLoading]);

  // Format timestamp into a readable format
  const formatTime = (timestamp?: string): string => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in ChatMessage:', timestamp);
        return '';
      }
      
      // Format the time
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp in ChatMessage:', error, 'Timestamp:', timestamp);
      return '';
    }
  };

  // Custom components for markdown rendering
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && match ? (
        <pre className={`language-${language}`}>
          <code className={`language-${language}`} {...props}>
            {String(children).replace(/\n$/, '')}
          </code>
        </pre>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Customize strong/bold text
    strong({ node, children, ...props }: any) {
      return <strong className="font-bold text-blue-700" {...props}>{children}</strong>;
    },
    // Customize other elements as needed
    p({ node, children, ...props }: any) {
      return <p className="mb-2" {...props}>{children}</p>;
    },
    a({ node, children, href, ...props }: any) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    // Improve list rendering
    ul({ node, children, ...props }: any) {
      return <ul className="list-disc pl-5 my-2 space-y-1" {...props}>{children}</ul>;
    },
    ol({ node, children, ...props }: any) {
      return <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>{children}</ol>;
    },
    // Improve blockquote rendering
    blockquote({ node, children, ...props }: any) {
      return <blockquote className="border-l-4 border-blue-400 pl-4 italic my-4 py-2 bg-blue-50 rounded-r-md" {...props}>{children}</blockquote>;
    },
    // Improve table rendering
    table({ node, children, ...props }: any) {
      return <table className="border-collapse border border-gray-300 my-4 w-full shadow-sm" {...props}>{children}</table>;
    },
    th({ node, children, ...props }: any) {
      return <th className="border border-gray-300 px-3 py-2 bg-gray-700 text-white font-bold" {...props}>{children}</th>;
    },
    td({ node, children, ...props }: any) {
      return <td className="border border-gray-300 px-3 py-2" {...props}>{children}</td>;
    }
  };

  return (
    <div className={`p-3 rounded-lg max-w-3/4 ${
      isUser 
        ? 'ml-auto bg-blue-100 text-blue-800' 
        : 'mr-auto bg-gray-100 text-gray-800'
    }`}>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "100ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "200ms" }}></div>
          </div>
          <span className="text-sm text-gray-500">AI is thinking...</span>
        </div>
      ) : isUser ? (
        <p className="whitespace-pre-wrap">{content}</p>
      ) : (
        <div ref={markdownRef} className="markdown-content prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      )}
      {timestamp && !isLoading && (
        <span className="text-xs text-gray-500 mt-1 block">
          {formatTime(timestamp)}
        </span>
      )}
    </div>
  );
};

export default ChatMessage; 