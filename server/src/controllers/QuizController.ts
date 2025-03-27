import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Quiz } from '../models/Quiz';

export class QuizController extends BaseController {
  constructor() {
    super(Quiz, 'Quiz');
  }

  // Submit quiz answers and calculate score
  submitQuiz = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const quizId = req.params.id;
      const { answers } = req.body;

      const quiz = await Quiz.findOne({ _id: quizId, user: userId });

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      let score = 0;
      answers.forEach((selectedOptionIndex: number, questionIndex: number) => {
        if (
          quiz.questions[questionIndex] &&
          quiz.questions[questionIndex].options[selectedOptionIndex] &&
          quiz.questions[questionIndex].options[selectedOptionIndex].isCorrect
        ) {
          score++;
        }
      });

      quiz.score = (score / quiz.questions.length) * 100;
      quiz.completed = true;
      await quiz.save();

      res.json(quiz);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      res.status(500).json({ message: 'Error submitting quiz' });
    }
  };

  // Get user's quiz statistics
  getStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const quizzes = await Quiz.find({ user: userId, completed: true });

      const stats = {
        totalQuizzes: quizzes.length,
        averageScore: quizzes.reduce((acc, quiz) => acc + quiz.score, 0) / quizzes.length || 0,
        completedQuizzes: quizzes.length,
        highestScore: Math.max(...quizzes.map(quiz => quiz.score), 0),
        lowestScore: Math.min(...quizzes.map(quiz => quiz.score), 0)
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting quiz stats:', error);
      res.status(500).json({ message: 'Error getting quiz stats' });
    }
  };
} 