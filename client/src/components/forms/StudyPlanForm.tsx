import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { PlusIcon, XIcon } from 'lucide-react';
import { Topic, StudyPlan } from '../../services/studyPlanService';

interface StudyPlanFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  plan?: StudyPlan;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

const StudyPlanForm: React.FC<StudyPlanFormProps> = ({ 
  onSubmit, 
  onCancel,
  plan,
  isLoading = false, 
  isSubmitting = false 
}) => {
  const [title, setTitle] = useState(plan?.title || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [topics, setTopics] = useState<Partial<Topic>[]>(
    plan?.topics?.length 
      ? plan.topics.map(topic => ({ ...topic }))
      : [{ title: '', description: '', completed: false }]
  );
  const [startDate, setStartDate] = useState<string>(
    plan?.startDate 
      ? new Date(plan.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    plan?.endDate
      ? new Date(plan.endDate).toISOString().split('T')[0]
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Update form data when plan changes
  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setDescription(plan.description);
      setTopics(plan.topics.map(topic => ({ ...topic })));
      setStartDate(new Date(plan.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(plan.endDate).toISOString().split('T')[0]);
    }
  }, [plan]);

  const addTopic = () => {
    setTopics([...topics, { title: '', description: '', completed: false }]);
  };

  const removeTopic = (index: number) => {
    if (topics.length <= 1) return;
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    setTopics(newTopics);
  };

  const updateTopicTitle = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index].title = value;
    setTopics(newTopics);
  };

  const updateTopicDescription = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index].description = value;
    setTopics(newTopics);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (title.trim() === '') {
      alert('Please enter a title');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    const filteredTopics = topics.filter(topic => topic.title?.trim() !== '');
    
    if (filteredTopics.length === 0) {
      alert('Please add at least one topic');
      return;
    }

    // Create or update study plan data
    const studyPlanData = {
      title,
      description,
      topics: filteredTopics,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    // If editing an existing plan, preserve the _id for each topic
    if (plan) {
      // Map topics to preserve _id for existing topics
      studyPlanData.topics = studyPlanData.topics.map(topic => {
        if (topic._id) {
          return topic;
        }
        // For new topics without an _id, return just the topic data
        return {
          title: topic.title,
          description: topic.description,
          completed: topic.completed || false
        };
      });
    }

    // Call onSubmit callback with the study plan data
    onSubmit(studyPlanData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{plan ? 'Update Study Plan' : 'Create New Study Plan'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mathematics Chapter 5"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A brief description of your study plan"
            rows={3}
          />
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topics
          </label>
          {topics.map((topic, index) => (
            <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Topic {index + 1}</h3>
                {topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTopic(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <XIcon size={16} />
                  </button>
                )}
              </div>
              
              <div className="mb-2">
                <input
                  type="text"
                  value={topic.title}
                  onChange={(e) => updateTopicTitle(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Topic title"
                  required
                />
              </div>
              
              <div>
                <textarea
                  value={topic.description || ''}
                  onChange={(e) => updateTopicDescription(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Topic description (optional)"
                  rows={2}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTopic}
            className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <PlusIcon size={16} className="mr-1" /> Add another topic
          </button>
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
            {isSubmitting ? "Saving..." : plan ? "Update Plan" : "Save Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudyPlanForm; 