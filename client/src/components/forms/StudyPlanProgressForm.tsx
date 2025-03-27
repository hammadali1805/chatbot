import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { Topic } from '../../services/studyPlanService';

interface StudyPlanProgressFormProps {
  planId: string;
  topics: Topic[];
  onSubmit: (planId: string, updates: { topics: Topic[] }) => void;
  onCancel: () => void;
}

const StudyPlanProgressForm: React.FC<StudyPlanProgressFormProps> = ({
  planId,
  topics,
  onSubmit,
  onCancel
}) => {
  const [updatedTopics, setUpdatedTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Initialize with the current topics
    setUpdatedTopics(topics);
    
    // Calculate initial progress
    calculateProgress(topics);
  }, [topics]);

  const calculateProgress = (topicList: Topic[]) => {
    if (topicList.length === 0) {
      setProgress(0);
      return;
    }
    
    const completedCount = topicList.filter(topic => topic.completed).length;
    const progressPercentage = Math.round((completedCount / topicList.length) * 100);
    setProgress(progressPercentage);
  };

  const toggleTopicCompletion = (topicId: string) => {
    const updatedTopicsList = updatedTopics.map(topic => {
      if (topic._id === topicId) {
        return { ...topic, completed: !topic.completed };
      }
      return topic;
    });

    setUpdatedTopics(updatedTopicsList);
    calculateProgress(updatedTopicsList);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      onSubmit(planId, { topics: updatedTopics });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Update Study Plan Progress</h2>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="space-y-3 mb-6">
        {updatedTopics.map((topic) => (
          <div key={topic._id} className="flex items-start p-3 bg-gray-50 rounded-md">
            <Checkbox 
              checked={topic.completed}
              onChange={() => topic._id && toggleTopicCompletion(topic._id)}
              className="mt-0.5"
            />
            <div className="ml-3">
              <span className={`${
                topic.completed ? 'line-through text-gray-400' : 'text-gray-700'
              }`}>
                {topic.title}
              </span>
              {topic.description && (
                <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button 
          variant="outline" 
          onClick={onCancel}
          type="button"
          className="border-gray-300"
        >
          Cancel
        </Button>
        <Button 
          variant="default"
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Saving..." : "Save Progress"}
        </Button>
      </div>
    </form>
  );
};

export default StudyPlanProgressForm; 