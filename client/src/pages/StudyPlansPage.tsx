import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
import { PlusIcon, DownloadIcon, EditIcon } from 'lucide-react';
import StudyPlanForm from '../components/forms/StudyPlanForm';
import StudyPlanProgressForm from '../components/forms/StudyPlanProgressForm';
import { studyPlanService, StudyPlan, Topic } from '../services/studyPlanService';
import { generateStudyPlanPDF } from '../utils/pdfUtils';

const StudyPlansPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStudyPlanForm, setShowStudyPlanForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showUpdatePlanForm, setShowUpdatePlanForm] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(id || null);

  // Fetch study plans from API
  useEffect(() => {
    const fetchStudyPlans = async () => {
      try {
        setIsLoading(true);
        const data = await studyPlanService.getAllStudyPlans();
        setStudyPlans(data);
        
        // If we have a specific ID parameter, set it as selected
        if (id && data.some(plan => plan._id === id)) {
          setSelectedPlanId(id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching study plans:', err);
        setError('Failed to load study plans');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyPlans();
  }, [id]);

  const toggleTaskCompletion = async (planId: string, topicId: string) => {
    try {
      const plan = studyPlans.find(p => p._id === planId);
      if (!plan) return;
      
      const topic = plan.topics.find(t => t._id === topicId);
      if (!topic) return;
      
      // Toggle completion status
      const updatedTopic = { ...topic, completed: !topic.completed };
      
      // Update in the backend
      await studyPlanService.updateTopic(planId, topicId, {
        completed: updatedTopic.completed
      });
      
      // Update local state
      setStudyPlans(plans => 
        plans.map(p => {
          if (p._id === planId) {
            return {
              ...p,
              topics: p.topics.map(t => 
                t._id === topicId ? { ...t, completed: updatedTopic.completed } : t
              )
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Error updating topic:', err);
      setError('Failed to update task');
    }
  };

  const handleCreatePlan = () => {
    setShowStudyPlanForm(true);
    setShowUpdatePlanForm(false);
    setShowProgressForm(false);
    setSelectedPlanId(null);
  };

  const handleViewDetails = (planId: string) => {
    setSelectedPlanId(planId);
    setShowStudyPlanForm(false);
    setShowProgressForm(false);
    setShowUpdatePlanForm(false);
  };

  const handleEditProgress = (planId: string) => {
    setSelectedPlanId(planId);
    setShowProgressForm(true);
    setShowStudyPlanForm(false);
    setShowUpdatePlanForm(false);
  };

  const handleEditPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setShowUpdatePlanForm(true);
    setShowStudyPlanForm(false);
    setShowProgressForm(false);
  };

  const handleDownloadPDF = (plan: StudyPlan) => {
    generateStudyPlanPDF(plan);
  };

  const handleAddStudyPlan = async (planData: any) => {
    try {
      setIsLoading(true);
      const newPlan = await studyPlanService.createStudyPlan(planData);
      setStudyPlans([...studyPlans, newPlan]);
      setShowStudyPlanForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating study plan:', err);
      setError('Failed to create study plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (planId: string, updates: { topics: Topic[] }) => {
    try {
      setIsLoading(true);
      const updatedPlan = await studyPlanService.updateStudyPlan(planId, updates);
      setStudyPlans(plans => 
        plans.map(p => p._id === planId ? updatedPlan : p)
      );
      setShowProgressForm(false);
      setError(null);
    } catch (err) {
      console.error('Error updating study plan:', err);
      setError('Failed to update study plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlan = async (planId: string, planData: any) => {
    try {
      setIsLoading(true);
      const updatedPlan = await studyPlanService.updateStudyPlan(planId, planData);
      setStudyPlans(plans => 
        plans.map(p => p._id === planId ? updatedPlan : p)
      );
      setShowUpdatePlanForm(false);
      setError(null);
    } catch (err) {
      console.error('Error updating study plan:', err);
      setError('Failed to update study plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await studyPlanService.deleteStudyPlan(planId);
      setStudyPlans(plans => plans.filter(p => p._id !== planId));
      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
      }
    } catch (err) {
      console.error('Error deleting study plan:', err);
      setError('Failed to delete study plan');
    }
  };

  // Render the plan details view
  const renderPlanDetails = () => {
    if (!selectedPlanId) return null;
    
    const plan = studyPlans.find(p => p._id === selectedPlanId);
    if (!plan) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{plan.title}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedPlanId(null)}
            >
              Back to List
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeletePlan(plan._id)}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Delete
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">Created on {new Date(plan.createdAt).toLocaleDateString()}</p>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{plan.progress}%</span>
          </div>
          <Progress value={plan.progress} className="h-2" />
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Tasks</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditProgress(plan._id)}
              className="flex items-center gap-1"
            >
              <EditIcon size={16} /> Edit Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditPlan(plan._id)}
              className="flex items-center gap-1"
            >
              <EditIcon size={16} /> Update Plan
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {plan.topics.map((topic) => (
            <div key={topic._id} className="flex items-start p-3 bg-gray-50 rounded-md">
              <div className="mt-0.5">
                <div className={`w-4 h-4 rounded border ${
                  topic.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`} />
              </div>
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
      </div>
    );
  };

  if (isLoading && studyPlans.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Study Plans</h1>
            <Button 
              variant="default" 
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreatePlan}
            >
              <PlusIcon size={18} className="mr-2" /> Create New Plan
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {showStudyPlanForm ? (
            <StudyPlanForm
              onSubmit={handleAddStudyPlan}
              onCancel={() => setShowStudyPlanForm(false)}
              isLoading={isLoading}
              isSubmitting={isLoading}
            />
          ) : showProgressForm && selectedPlanId ? (
            <StudyPlanProgressForm
              planId={selectedPlanId}
              topics={studyPlans.find(p => p._id === selectedPlanId)?.topics || []}
              onSubmit={handleUpdateProgress}
              onCancel={() => setShowProgressForm(false)}
            />
          ) : showUpdatePlanForm && selectedPlanId ? (
            <StudyPlanForm
              plan={studyPlans.find(p => p._id === selectedPlanId)}
              onSubmit={(data) => handleUpdatePlan(selectedPlanId, data)}
              onCancel={() => setShowUpdatePlanForm(false)}
              isLoading={isLoading}
              isSubmitting={isLoading}
            />
          ) : selectedPlanId ? (
            renderPlanDetails()
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Study Plans</h2>

              {studyPlans.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No study plans yet. Create one to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyPlans.map((plan) => (
                    <Card key={plan._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-semibold text-blue-700">{plan.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Created on {new Date(plan.createdAt).toLocaleDateString()}</p>
                      </div>

                      <CardContent className="p-6">
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="h-2" />
                        </div>

                        <div>
                          <div className="space-y-2">
                            {plan.topics.slice(0, 2).map((topic) => (
                              <div key={topic._id} className="flex items-start">
                                <div className="mt-0.5">
                                  <div className={`w-4 h-4 rounded border ${
                                    topic.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                  }`} />
                                </div>
                                <span
                                  className={`ml-3 ${
                                    topic.completed ? 'line-through text-gray-400' : 'text-gray-700'
                                  }`}
                                >
                                  {topic.title}
                                </span>
                              </div>
                            ))}
                            {plan.topics.length > 2 && (
                              <p className="text-sm text-gray-500 mt-1">
                                +{plan.topics.length - 2} more tasks
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePlan(plan._id)}
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                          Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(plan._id)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StudyPlansPage; 