import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types for the data structures
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  description?: string;
  progress: number;
  tasks: Task[];
  createdAt: string;
  chatId?: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  questions: QuizQuestion[];
  score?: number;
  status: 'completed' | 'in_progress';
  chatId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  chatId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

// Define the shape of the context
interface AppContextType {
  // Study Plans
  studyPlans: StudyPlan[];
  addStudyPlan: (plan: Omit<StudyPlan, 'id'>) => void;
  updateStudyPlan: (id: string, plan: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
  
  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Chats
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
  addChat: (title: string) => string;
  addMessageToChat: (chatId: string, message: Omit<ChatMessage, 'id'>) => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize state for study plans
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([
    {
      id: '1',
      title: 'Mathematics Calculus',
      createdAt: '15/10/2023',
      progress: 75,
      tasks: [
        { id: 't1', title: 'Derivatives', completed: true },
        { id: 't2', title: 'Integrals', completed: true },
        { id: 't3', title: 'Applications', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Physics Mechanics',
      createdAt: '10/10/2023',
      progress: 30,
      tasks: [
        { id: 't1', title: 'Newton\'s Laws', completed: true },
        { id: 't2', title: 'Conservation of Energy', completed: false },
        { id: 't3', title: 'Momentum', completed: false },
      ],
    },
  ]);

  // Initialize state for quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Mathematics Quiz',
      topic: 'Algebra',
      createdAt: '12/10/2023',
      questions: [
        {
          id: 'q1',
          question: 'What is 2+2?',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
            { text: '22', isCorrect: false }
          ]
        }
      ],
      score: 85,
      status: 'completed',
    },
    {
      id: '2',
      title: 'Physics Quiz',
      topic: 'Mechanics',
      createdAt: '14/10/2023',
      questions: [
        {
          id: 'q1',
          question: 'What is Newton\'s First Law?',
          options: [
            { text: 'An object at rest stays at rest', isCorrect: true },
            { text: 'Force equals mass times acceleration', isCorrect: false },
            { text: 'Energy cannot be created or destroyed', isCorrect: false },
            { text: 'For every action there is an equal and opposite reaction', isCorrect: false }
          ]
        }
      ],
      status: 'in_progress',
    },
  ]);

  // Initialize state for notes
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'History: World War II',
      createdAt: '5/10/2023',
      content: 'Key events and timeline of World War II including major battles and political developments...',
    },
    {
      id: '2',
      title: 'Biology: Cell Structure',
      createdAt: '8/10/2023',
      content: 'Detailed notes on cell structure including organelles and their functions in eukaryotic and prokaryotic cells...',
    },
  ]);

  // Initialize state for chats
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Math Study Plan',
      createdAt: '2 days ago',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: 'Can you help me create a study plan for calculus?',
          timestamp: new Date('2023-10-15T15:30:00')
        },
        {
          id: 'm2',
          role: 'assistant',
          content: 'Of course! Let\'s create a study plan for calculus. What topics are you particularly interested in?',
          timestamp: new Date('2023-10-15T15:31:00')
        }
      ]
    },
    {
      id: '2',
      title: 'Physics Quiz Prep',
      createdAt: '1 week ago',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: 'I need help preparing for my physics exam',
          timestamp: new Date('2023-10-10T10:15:00')
        },
        {
          id: 'm2',
          role: 'assistant',
          content: 'I can help you prepare for your physics exam. What topics will be covered?',
          timestamp: new Date('2023-10-10T10:16:00')
        }
      ]
    },
    {
      id: '3',
      title: 'History Notes',
      createdAt: '2 weeks ago',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: 'Can you help me take notes on World War II?',
          timestamp: new Date('2023-10-05T14:20:00')
        },
        {
          id: 'm2',
          role: 'assistant',
          content: 'I\'d be happy to help you take notes on World War II. Let\'s start with the key events and timeline.',
          timestamp: new Date('2023-10-05T14:21:00')
        }
      ]
    }
  ]);

  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  // Study Plan functions
  const addStudyPlan = (plan: Omit<StudyPlan, 'id'>) => {
    const newPlan: StudyPlan = {
      ...plan,
      id: Date.now().toString(),
    };
    setStudyPlans([...studyPlans, newPlan]);
    return newPlan.id;
  };

  const updateStudyPlan = (id: string, updates: Partial<StudyPlan>) => {
    setStudyPlans(
      studyPlans.map((plan) =>
        plan.id === id ? { ...plan, ...updates } : plan
      )
    );
  };

  const deleteStudyPlan = (id: string) => {
    setStudyPlans(studyPlans.filter((plan) => plan.id !== id));
  };

  // Quiz functions
  const addQuiz = (quiz: Omit<Quiz, 'id'>) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: Date.now().toString(),
    };
    setQuizzes([...quizzes, newQuiz]);
    return newQuiz.id;
  };

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes(
      quizzes.map((quiz) =>
        quiz.id === id ? { ...quiz, ...updates } : quiz
      )
    );
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
  };

  // Note functions
  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
    };
    setNotes([...notes, newNote]);
    return newNote.id;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  // Chat functions
  const addChat = (title: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date().toLocaleDateString()
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
    return newChat.id;
  };

  const addMessageToChat = (chatId: string, message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString()
    };
    
    setChats(chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    ));
    
    if (currentChat?.id === chatId) {
      setCurrentChat({
        ...currentChat,
        messages: [...currentChat.messages, newMessage]
      });
    }
  };

  const value = {
    studyPlans,
    addStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
    
    quizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    
    notes,
    addNote,
    updateNote,
    deleteNote,
    
    chats,
    currentChat,
    setCurrentChat,
    addChat,
    addMessageToChat
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 