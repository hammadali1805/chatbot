import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PlusIcon } from 'lucide-react';
import QuizForm from '../components/forms/QuizForm';
import { quizService, Quiz } from '../services/quizService';

const QuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleCreateQuiz = () => {
    setShowQuizForm(true);
    setSelectedQuizId(null);
  };

  const handleViewResults = (quizId: string) => {
    setSelectedQuizId(quizId);
    setQuizCompleted(true);
  };

  const handleContinueQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setActiveQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[activeQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = async () => {
    const quiz = quizzes.find(q => q._id === selectedQuizId);
    if (!quiz) return;
    
    if (activeQuestionIndex < quiz.questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else {
      try {
        setIsLoading(true);
        // Submit answers to the API
        const updatedQuiz = await quizService.submitQuiz(quiz._id, userAnswers);
        
        // Update local state
        setQuizzes(prevQuizzes => 
          prevQuizzes.map(q => q._id === updatedQuiz._id ? updatedQuiz : q)
        );
        
        setQuizCompleted(true);
        setError(null);
      } catch (err) {
        console.error('Error submitting quiz:', err);
        setError('Failed to submit quiz answers');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedQuizId(null);
    setShowQuizForm(false);
  };

  const handleAddQuiz = async (quizData: any) => {
    try {
      setIsLoading(true);
      const newQuiz = await quizService.createQuiz(quizData);
      setQuizzes([...quizzes, newQuiz]);
      setShowQuizForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes(quizzes => quizzes.filter(q => q._id !== quizId));
      if (selectedQuizId === quizId) {
        setSelectedQuizId(null);
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz');
    }
  };

  // Render quiz taking interface
  const renderQuizTaking = () => {
    if (!selectedQuizId) return null;
    
    const quiz = quizzes.find(q => q._id === selectedQuizId);
    if (!quiz) return null;
    
    const currentQuestion = quiz.questions[activeQuestionIndex];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{quiz.title}</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToList}
          >
            Exit Quiz
          </Button>
        </div>
        
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {activeQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className={`p-3 border rounded-md cursor-pointer ${
                  userAnswers[activeQuestionIndex] === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectOption(index)}
              >
                {option.text}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="blue" 
            onClick={handleNextQuestion}
            disabled={userAnswers[activeQuestionIndex] === undefined || isLoading}
          >
            {isLoading ? 'Processing...' : (activeQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz')}
          </Button>
        </div>
      </div>
    );
  };

  // Render quiz results
  const renderQuizResults = () => {
    if (!selectedQuizId) return null;
    
    const quiz = quizzes.find(q => q._id === selectedQuizId);
    if (!quiz || !quiz.completed) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{quiz.title}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToList}
            >
              Back to List
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteQuiz(quiz._id)}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Delete
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-md">
            <span className="font-medium">Your Score</span>
            <span className="text-xl font-bold text-blue-600">{quiz.score}%</span>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Questions</h3>
        
        <div className="space-y-6">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="border rounded-md p-4">
              <h4 className="font-medium mb-3">
                {qIndex + 1}. {question.question}
              </h4>
              
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <div 
                    key={oIndex}
                    className={`p-2 rounded-md ${
                      option.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'text-gray-700'
                    }`}
                  >
                    {option.isCorrect && <span className="mr-2">✓</span>}
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading && quizzes.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-800">Quizzes</h1>
            <Button 
              variant="default" 
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreateQuiz}
            >
              <PlusIcon size={18} className="mr-2" /> Create New Quiz
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {showQuizForm ? (
            <QuizForm
              onSubmit={handleAddQuiz}
              onCancel={() => setShowQuizForm(false)}
            />
          ) : selectedQuizId ? (
            quizCompleted ? renderQuizResults() : renderQuizTaking()
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Quizzes</h2>

              {quizzes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No quizzes yet. Create one to test your knowledge!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <Card key={quiz._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-blue-700">{quiz.title}</h3>
                          <div>
                            {quiz.completed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Not Started
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Created on {new Date(quiz.createdAt).toLocaleDateString()}</p>
                      </div>

                      <CardContent className="p-6">
                        <div>
                          <p className="text-sm text-gray-600">
                            {quiz.questions.length} questions
                          </p>
                          {quiz.completed && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">Score: </span>
                              <span className="text-sm font-bold text-blue-600">{quiz.score}%</span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                          Delete
                        </Button>
                        <div className="space-x-2">
                          {quiz.completed ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewResults(quiz._id)}
                            >
                              View Results
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleContinueQuiz(quiz._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Start Quiz
                            </Button>
                          )}
                        </div>
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

export default QuizzesPage; 