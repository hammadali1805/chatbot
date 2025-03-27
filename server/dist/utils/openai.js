"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = exports.generateNotes = exports.generateQuiz = exports.generateStudyPlan = exports.getChatResponse = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// OpenAI API configuration
const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';
/**
 * Send a message to the OpenAI API and get a response
 * @param messages Array of message objects with role and content
 * @returns The assistant's response
 */
const getChatResponse = (messages) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.post(API_URL, {
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500,
            temperature: 0.7,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error('OpenAI API Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new Error('Failed to get response from AI service');
    }
});
exports.getChatResponse = getChatResponse;
/**
 * Generate a study plan based on a topic
 * @param topic The topic for the study plan
 * @param timeframe The time available for the study plan
 * @returns Generated study plan
 */
const generateStudyPlan = (topic, timeframe) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = `Create a detailed study plan for ${topic} over a period of ${timeframe}. Include:
  1. A breakdown of topics to cover
  2. Specific tasks for each topic
  3. Recommended resources
  4. Milestones and goals`;
    const messages = [
        { role: 'system', content: 'You are a helpful educational assistant that specializes in creating detailed study plans.' },
        { role: 'user', content: prompt }
    ];
    return (0, exports.getChatResponse)(messages);
});
exports.generateStudyPlan = generateStudyPlan;
/**
 * Generate a quiz based on a topic
 * @param topic The topic for the quiz
 * @param difficulty The difficulty level (easy, medium, hard)
 * @param questionCount Number of questions to generate
 * @returns Generated quiz in JSON format
 */
const generateQuiz = (topic, difficulty, questionCount) => __awaiter(void 0, void 0, void 0, function* () {
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
    return (0, exports.getChatResponse)(messages);
});
exports.generateQuiz = generateQuiz;
/**
 * Generate study notes based on content
 * @param content The content to generate notes for
 * @returns Generated notes
 */
const generateNotes = (content) => __awaiter(void 0, void 0, void 0, function* () {
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
    return (0, exports.getChatResponse)(messages);
});
exports.generateNotes = generateNotes;
const generateResponse = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error('Error calling OpenAI:', error);
        throw new Error('Failed to generate response');
    }
});
exports.generateResponse = generateResponse;
