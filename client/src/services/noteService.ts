import api from './api';

export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export const noteService = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
  },

  // Get single note
  getNote: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Create new note
  createNote: async (noteData: Omit<Note, '_id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  // Update note
  updateNote: async (id: string, noteData: Partial<Omit<Note, '_id' | 'user' | 'createdAt' | 'updatedAt'>>): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  // Search notes
  searchNotes: async (query: string): Promise<Note[]> => {
    const response = await api.get('/notes/search', {
      params: { query }
    });
    return response.data;
  },

  // Get notes by category
  getNotesByCategory: async (category: string): Promise<Note[]> => {
    const response = await api.get(`/notes/category/${category}`);
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/notes/categories');
    return response.data;
  },

  // Delete note
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  }
}; 