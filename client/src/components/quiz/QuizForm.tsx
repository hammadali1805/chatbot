import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService, Question, Option } from '../../services/quizService';
import { Button } from '../ui/button';

export const QuizForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { 
      question: '', 
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ] 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { 
        question: '', 
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ] 
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    // Set all options to false first
    newQuestions[questionIndex].options.forEach((option, idx) => {
      option.isCorrect = idx === optionIndex;
    });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          setError(`Option ${j + 1} for question ${i + 1} is empty`);
          return;
        }
      }

      // Ensure one option is marked as correct
      if (!question.options.some(option => option.isCorrect)) {
        setError(`Question ${i + 1} needs a correct answer`);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const quiz = await quizService.createQuiz({
        title,
        description,
        questions
      });

      // Redirect to the quiz page
      navigate(`/quizzes/${quiz._id}`);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Questions</h2>
            <Button type="button" onClick={handleAddQuestion}>
              Add Question
            </Button>
          </div>

          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border rounded p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">Question {questionIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(questionIndex)}
                  className="text-red-500 hover:text-red-700"
                  disabled={questions.length === 1}
                >
                  Remove
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter question"
                  required
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Options</p>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`q-${questionIndex}-opt-${optionIndex}`}
                      name={`q-${questionIndex}-correct`}
                      checked={option.isCorrect}
                      onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Option ${optionIndex + 1}`}
                      required
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500">Select the radio button for the correct answer</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </div>
  );
}; 