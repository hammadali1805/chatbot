import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizService, Quiz } from '../../services/quizService';
import { Button } from '../ui/button';

export const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        const loadedQuizzes = await quizService.getAllQuizzes();
        setQuizzes(loadedQuizzes);
      } catch (err) {
        console.error('Error loading quizzes:', err);
        setError('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId));
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz');
    }
  };

  const handleCreateQuiz = () => {
    navigate('/quizzes/create');
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Quizzes</h1>
        <Button onClick={handleCreateQuiz}>Create New Quiz</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't created any quizzes yet.</p>
          <Button onClick={handleCreateQuiz} className="mt-4">
            Create Your First Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
                <button
                  onClick={() => handleDeleteQuiz(quiz._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {quiz.description || 'No description'}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {quiz.questions.length} questions
                </span>
                {quiz.completed ? (
                  <div className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                    Score: {quiz.score.toFixed(0)}%
                  </div>
                ) : (
                  <Link
                    to={`/quizzes/${quiz._id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Take Quiz
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 