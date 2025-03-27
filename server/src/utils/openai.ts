import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI API configuration
const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Send a message to the OpenAI API and get a response
 * @param messages Array of message objects with role and content
 * @returns The assistant's response
 */
export const getChatResponse = async (messages: { role: string; content: string }[]): Promise<string> => {
  try {
    const response = await axios.post<OpenAIResponse>(
      API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    throw new Error('Failed to get response from AI service');
  }
};

/**
 * Generate a study plan based on a topic
 * @param topic The topic for the study plan
 * @param timeframe The time available for the study plan
 * @returns Generated study plan
 */
export const generateStudyPlan = async (topic: string, timeframe: string): Promise<string> => {
  const prompt = `Create a detailed study plan for ${topic} over a period of ${timeframe}. Include:
  1. A breakdown of topics to cover
  2. Specific tasks for each topic
  3. Recommended resources
  4. Milestones and goals`;

  const messages = [
    { role: 'system', content: 'You are a helpful educational assistant that specializes in creating detailed study plans.' },
    { role: 'user', content: prompt }
  ];

  return getChatResponse(messages);
};

/**
 * Generate a quiz based on a topic
 * @param topic The topic for the quiz
 * @param difficulty The difficulty level (easy, medium, hard)
 * @param questionCount Number of questions to generate
 * @returns Generated quiz in JSON format
 */
export const generateQuiz = async (
  topic: string,
  difficulty: string,
  questionCount: number
): Promise<string> => {
  const prompt = `Create a ${difficulty} difficulty quiz on ${topic} with ${questionCount} questions. 
  Format the response as a JSON array where each element is an object with:
  1. "question": the question text
  2. "options": an array of 4 possible answers
  3. "correctIndex": the index of the correct answer (0-3)
  4. "explanation": brief explanation of the correct answer`;

  const messages = [
    { role: 'system', content: 'You are a helpful educational assistant that specializes in creating quizzes.' },
    { role: 'user', content: prompt }
  ];

  return getChatResponse(messages);
};

/**
 * Generate study notes based on content
 * @param content The content to generate notes for
 * @returns Generated notes
 */
export const generateNotes = async (content: string): Promise<string> => {
  const prompt = `Summarize the following content into concise, well-structured study notes:
  
  ${content}
  
  Include:
  1. Key concepts and definitions
  2. Important points to remember
  3. Examples where appropriate
  4. Organize with headings and bullet points`;

  const messages = [
    { role: 'system', content: 'You are a helpful educational assistant that specializes in creating study notes.' },
    { role: 'user', content: prompt }
  ];

  return getChatResponse(messages);
};

export const generateResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI tutor.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to generate response');
  }
}; 