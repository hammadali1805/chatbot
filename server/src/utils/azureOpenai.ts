import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Azure OpenAI API configuration
const API_KEY = process.env.AZURE_OPENAI_API_KEY;
const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo';
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2023-05-15';

// Regular OpenAI API for fallback
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface Message {
  role: string;
  content: string;
}

interface AzureOpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call Azure OpenAI API to get a response for the chat
 * @param messages Array of message objects with role and content
 * @returns The assistant's response text
 */
export const getAzureChatResponse = async (messages: Message[]): Promise<string> => {
  try {
    console.log(messages);
    if (!API_KEY || !ENDPOINT) {
      console.log('Azure OpenAI not configured, attempting to use regular OpenAI API');
      return await getRegularOpenAIResponse(messages);
    }

    console.log(`Calling Azure OpenAI API with ${messages.length} messages`);
    
    const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
  
    const response = await axios.post<AzureOpenAIResponse>(
      url,
      {
        messages,
        max_tokens: 800,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
      }
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('No response choices returned from Azure OpenAI');
    }

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Azure OpenAI API Error:', error.response?.data || error.message);
    
    // Try to use regular OpenAI API as a fallback
    try {
      console.log('Falling back to regular OpenAI API');
      return await getRegularOpenAIResponse(messages);
    } catch (fallbackError) {
      console.error('OpenAI API Fallback Error:', fallbackError);
      throw new Error(`Failed to get response from AI services: ${error.message}`);
    }
  }
};

/**
 * Call regular OpenAI API as a fallback
 * @param messages Array of message objects with role and content
 * @returns The assistant's response text
 */
const getRegularOpenAIResponse = async (messages: Message[]): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await axios.post<AzureOpenAIResponse>(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );

  if (!response.data.choices || response.data.choices.length === 0) {
    throw new Error('No response choices returned from OpenAI');
  }

  return response.data.choices[0].message.content;
}; 