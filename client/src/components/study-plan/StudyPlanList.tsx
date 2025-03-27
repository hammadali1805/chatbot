import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studyPlanService, StudyPlan } from '../../services/studyPlanService';
import { Button } from '../ui/button';

export const StudyPlanList: React.FC = () => {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load study plans
  useEffect(() => {
    const loadStudyPlans = async () => {
      try {
        setIsLoading(true);
        const loadedPlans = await studyPlanService.getAllStudyPlans();
        setStudyPlans(loadedPlans);
      } catch (err) {
        console.error('Error loading study plans:', err);
        setError('Failed to load study plans');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudyPlans();
  }, []);

  const handleDeletePlan = async (planId: string) => {
    try {
      await studyPlanService.deleteStudyPlan(planId);
      setStudyPlans(prevPlans => prevPlans.filter(plan => plan._id !== planId));
    } catch (err) {
      console.error('Error deleting study plan:', err);
      setError('Failed to delete study plan');
    }
  };

  const handleCreatePlan = () => {
    navigate('/study-plans/create');
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Study Plans</h1>
        <Button onClick={handleCreatePlan}>Create New Plan</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : studyPlans.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't created any study plans yet.</p>
          <Button onClick={handleCreatePlan} className="mt-4">
            Create Your First Study Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyPlans.map((plan) => (
            <div key={plan._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {plan.description || 'No description'}
              </p>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Progress: {Math.round(plan.progress)}%
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {plan.topics.length} topics
                </span>
                <Link
                  to={`/study-plans/${plan._id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View Details
                </Link>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 