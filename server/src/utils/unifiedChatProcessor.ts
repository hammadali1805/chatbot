import { getAzureChatResponse } from './azureOpenai';

type IntentType = 'query' | 'quiz' | 'study_plan' | 'note';
type ActionType = 'create' | 'update' | 'delete' | null;

interface IOption {
  text: string;
  isCorrect: boolean;
}

interface IQuestion {
  question: string;
  options: IOption[];
  explanation?: string;
}

interface ITopic {
  title: string;
  description?: string;
  deadline?: string;
}

interface UnifiedResponse {
  intent: {
    type: IntentType;
    action: ActionType;
    topic?: string;
    subject?: string;
  };
  message: {
    content: string;
    metadata?: {
      type: IntentType;
      action: ActionType;
      referenceId?: string;
    };
  };
  document?: {
    quiz?: {
      title: string;
      description?: string;
      questions: IQuestion[];
    };
    studyPlan?: {
      title: string;
      description: string;
      topics: ITopic[];
      startDate: string;
      endDate: string;
    };
    note?: {
      title: string;
      content: string;
      tags?: string[];
    };
  };
}

export const processChat = async (
  message: string, 
  context: any,
  messageHistory: Array<{ role: string; content: string }> = []
): Promise<UnifiedResponse> => {
  const systemPrompt = `You are an AI study assistant. Analyze the message and respond in a specific JSON format.

Current Context:
${JSON.stringify(context, null, 2)}

Recent Message History:
${messageHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Rules for Response:
1. For regular queries (type: "query"), only include intent and message
2. For create/update actions, include the complete document structure
3. For delete actions, only include intent and message
4. Consider the context for better responses
5. Generate appropriate content based on the subject/topic
6. Include detailed explanations in quiz questions
7. Create structured study plans with realistic deadlines
8. Format dates in ISO string format

Required JSON Structure:
{
  "intent": {
    "type": "quiz|study_plan|note|query",
    "action": "create|update|delete|null",
    "topic": "specific topic",
    "subject": "main subject area"
  },
  "message": {
    "content": "your response message",
    "metadata": {
      "type": "same as intent.type",
      "action": "same as intent.action"
    }
  },
  "document": {
    // Include only one of these based on intent.type
    "quiz": {
      "title": "quiz title",
      "description": "quiz description",
      "questions": [
        {
          "question": "question text",
          "options": [
            { "text": "option text", "isCorrect": boolean }
          ],
          "explanation": "explanation text"
        }
      ]
    },
    "studyPlan": {
      "title": "plan title",
      "description": "plan description",
      "topics": [
        {
          "title": "topic title",
          "description": "topic description",
          "deadline": "ISO date string"
        }
      ],
      "startDate": "ISO date string",
      "endDate": "ISO date string"
    },
    "note": {
      "title": "note title",
      "content": "note content",
      "tags": ["tag1", "tag2"]
    }
  }
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...messageHistory,
    { role: 'user', content: message }
  ];

  try {
    const response = await getAzureChatResponse(messages);
    const parsedResponse = JSON.parse(response) as UnifiedResponse;
    console.log('Parsed response:', parsedResponse);
    // Validate response structure
    if (!parsedResponse.intent || !parsedResponse.message) {
      throw new Error('Invalid response structure');
    }

    // Ensure metadata matches intent
    if (parsedResponse.message.metadata) {
      parsedResponse.message.metadata = {
        type: parsedResponse.intent.type,
        action: parsedResponse.intent.action,
        referenceId: parsedResponse.message.metadata.referenceId
      };
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error processing chat:', error);
    // Return a fallback query response
    return {
      intent: {
        type: 'query',
        action: null,
        topic: undefined,
        subject: undefined
      },
      message: {
        content: 'I apologize, but I encountered an error processing your request. Could you please rephrase your question?'
      }
    };
  }
}; 