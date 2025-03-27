import React, { useState } from 'react';
import { Button } from '../ui/button';
import { PlusIcon, XIcon } from 'lucide-react';
import { Option } from '../../services/quizService';

interface QuizFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface FormQuestion {
  question: string;
  options: Option[];
}

const QuizForm: React.FC<QuizFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([
    {
      question: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    },
  ]);

  const addQuestion = () => {
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
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(newQuestions);
  };

  const updateCorrectOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    
    // Set all options to false, then set the selected one to true
    newQuestions[questionIndex].options.forEach((option, idx) => {
      option.isCorrect = idx === optionIndex;
    });
    
    setQuestions(newQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (title.trim() === '') {
      alert('Please enter a quiz title');
      return;
    }

    // Check if all questions are filled
    const isValid = questions.every(
      (q) => 
        q.question.trim() !== '' && 
        q.options.every(option => option.text.trim() !== '') &&
        q.options.some(option => option.isCorrect)
    );

    if (!isValid) {
      alert('Please fill out all questions and options, and select a correct answer for each question');
      return;
    }

    // Create quiz object
    const newQuiz = {
      title,
      description,
      questions
    };
    
    // Call onSubmit callback
    onSubmit(newQuiz);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quiz Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mathematics Quiz"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A brief description of your quiz"
            rows={3}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-700">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusIcon size={16} className="mr-1" /> Add Question
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question {qIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your question"
                    required
                  />
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <XIcon size={16} />
                  </button>
                )}
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (Select the correct answer)
                </label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center mb-2">
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => updateCorrectOption(qIndex, oIndex)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${oIndex + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="blue" type="submit">
            Create Quiz
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm; 