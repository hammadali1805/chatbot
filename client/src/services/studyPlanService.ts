import api from './api';

export interface Topic {
  _id?: string; // Add _id field for MongoDB compatibility
  title: string;
  description?: string;
  completed: boolean;
  deadline?: Date;
}

export interface StudyPlan {
  _id: string;
  user: string; // Changed from userId to user to match backend model
  title: string;
  description: string;
  topics: Topic[];
  startDate: Date;
  endDate: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export const studyPlanService = {
  // Get all study plans
  getAllStudyPlans: async (): Promise<StudyPlan[]> => {
    const response = await api.get('/study-plans');
    return response.data;
  },

  // Get single study plan
  getStudyPlan: async (id: string): Promise<StudyPlan> => {
    const response = await api.get(`/study-plans/${id}`);
    return response.data;
  },

  // Create new study plan
  createStudyPlan: async (planData: Omit<StudyPlan, '_id' | 'user' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<StudyPlan> => {
    const response = await api.post('/study-plans', planData);
    return response.data;
  },

  // Update study plan
  updateStudyPlan: async (id: string, planData: Partial<Omit<StudyPlan, '_id' | 'user' | 'createdAt' | 'updatedAt'>>): Promise<StudyPlan> => {
    const response = await api.put(`/study-plans/${id}`, planData);
    return response.data;
  },

  // Update topic
  updateTopic: async (planId: string, topicId: string, topicData: Partial<Topic>): Promise<StudyPlan> => {
    const response = await api.put(`/study-plans/${planId}/topics/${topicId}`, topicData);
    return response.data;
  },

  // Get study plans by date range
  getByDateRange: async (startDate: Date, endDate: Date): Promise<StudyPlan[]> => {
    const response = await api.get('/study-plans/date-range', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data;
  },

  // Delete study plan
  deleteStudyPlan: async (id: string): Promise<void> => {
    await api.delete(`/study-plans/${id}`);
  }
}; 