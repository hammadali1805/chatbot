import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { ChatController } from '../controllers/ChatController';
import { QuizController } from '../controllers/QuizController';
import { StudyPlanController } from '../controllers/StudyPlanController';
import { NoteController } from '../controllers/NoteController';

const router = express.Router();

// Initialize controllers
const chatController = new ChatController();
const quizController = new QuizController();
const studyPlanController = new StudyPlanController();
const noteController = new NoteController();

// Chat routes
router.get('/chats', authMiddleware, chatController.getAll);
router.get('/chats/:id', authMiddleware, chatController.getOne);
router.post('/chats', authMiddleware, chatController.create);
router.post('/chats/:id/messages', authMiddleware, chatController.addMessage);
router.put('/chats/:id', authMiddleware, chatController.update);
router.delete('/chats/:id', authMiddleware, chatController.delete);

// Quiz routes
router.get('/quizzes', authMiddleware, quizController.getAll);
router.get('/quizzes/stats', authMiddleware, quizController.getStats);
router.get('/quizzes/:id', authMiddleware, quizController.getOne);
router.post('/quizzes', authMiddleware, quizController.create);
router.post('/quizzes/:id/submit', authMiddleware, quizController.submitQuiz);
router.put('/quizzes/:id', authMiddleware, quizController.update);
router.delete('/quizzes/:id', authMiddleware, quizController.delete);

// Study Plan routes
router.get('/study-plans', authMiddleware, studyPlanController.getAll);
router.get('/study-plans/date-range', authMiddleware, studyPlanController.getByDateRange);
router.get('/study-plans/:id', authMiddleware, studyPlanController.getById);
router.post('/study-plans', authMiddleware, studyPlanController.create);
router.put('/study-plans/:id', authMiddleware, studyPlanController.update);
router.put('/study-plans/:id/topics/:topicId', authMiddleware, studyPlanController.updateTopic);
router.delete('/study-plans/:id', authMiddleware, studyPlanController.delete);

// Note routes
router.get('/notes', authMiddleware, noteController.getAll);
router.get('/notes/search', authMiddleware, noteController.search);
router.get('/notes/:id', authMiddleware, noteController.getOne);
router.post('/notes', authMiddleware, noteController.create);
router.put('/notes/:id', authMiddleware, noteController.update);
router.delete('/notes/:id', authMiddleware, noteController.delete);

export default router; 