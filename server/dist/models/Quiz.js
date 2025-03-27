"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const quizSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chatId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    questions: [
        {
            text: {
                type: String,
                required: true,
            },
            options: [
                {
                    text: {
                        type: String,
                        required: true,
                    },
                    isCorrect: {
                        type: Boolean,
                        required: true,
                    },
                },
            ],
            explanation: {
                type: String,
            },
        },
    ],
    userResponses: [
        {
            questionIndex: {
                type: Number,
                required: true,
            },
            selectedOptionIndex: {
                type: Number,
                required: true,
            },
            isCorrect: {
                type: Boolean,
                required: true,
            },
        },
    ],
    score: {
        type: Number,
        default: 0,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    timeLimit: {
        type: Number, // in minutes
    },
}, {
    timestamps: true,
});
// Calculate score whenever userResponses changes
quizSchema.pre('save', function (next) {
    const quiz = this;
    if (quiz.isModified('userResponses') && quiz.questions.length > 0) {
        const correctAnswers = quiz.userResponses.filter((response) => response.isCorrect).length;
        quiz.score = Math.round((correctAnswers / quiz.questions.length) * 100);
        // Mark as completed if all questions are answered
        if (quiz.userResponses.length === quiz.questions.length) {
            quiz.completed = true;
        }
    }
    next();
});
exports.default = mongoose_1.default.model('Quiz', quizSchema);
