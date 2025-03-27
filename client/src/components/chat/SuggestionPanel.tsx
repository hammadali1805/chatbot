import React from 'react';
import { BookOpen, FileQuestion, FileText } from 'lucide-react';

interface SuggestionPanelProps {
  onSuggestionClick: (suggestion: string) => void;
  onClose?: () => void;
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ onSuggestionClick, onClose }) => {
  const suggestions = [
    {
      id: 'study-plan',
      icon: <BookOpen size={18} />,
      title: 'Create Study Plan',
      description: 'Generate a structured study plan with tasks and resources',
    },
    {
      id: 'quiz',
      icon: <FileQuestion size={18} />,
      title: 'Generate Quiz',
      description: 'Create a quiz to test your knowledge on a specific topic',
    },
    {
      id: 'notes',
      icon: <FileText size={18} />,
      title: 'Save Notes',
      description: 'Save the current conversation as a note for future reference',
    },
  ];

  return (
    <div className="p-4 border-t border-gray-200 bg-white relative">
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
      <h3 className="text-sm font-medium text-gray-700 mb-3">Suggestions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.title)}
            className="flex flex-col gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="text-blue-600">
                {suggestion.icon}
              </div>
              <span className="font-medium">{suggestion.title}</span>
            </div>
            <p className="text-xs text-gray-500">{suggestion.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPanel; 