import api from './api';

export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  question: string;
  options: Option[];
  explanation?: string;
}

export interface Quiz {
  _id: string;
  user: string;
  title: string;
  description?: string;
  questions: Question[];
  score: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  completedQuizzes: number;
  highestScore: number;
  lowestScore: number;
}

export const quizService = {
  // Get all quizzes
  getAllQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  // Get single quiz
  getQuiz: async (id: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  // Create new quiz
  createQuiz: async (quizData: Omit<Quiz, '_id' | 'user' | 'score' | 'completed' | 'createdAt' | 'updatedAt'>): Promise<Quiz> => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  // Submit quiz answers
  submitQuiz: async (id: string, answers: number[]): Promise<Quiz> => {
    const response = await api.post(`/quizzes/${id}/submit`, { answers });
    return response.data;
  },

  // Get quiz statistics
  getQuizStats: async (): Promise<QuizStats> => {
    const response = await api.get('/quizzes/stats');
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id: string): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  }
}; 