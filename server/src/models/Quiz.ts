import mongoose, { Document, Schema } from 'mongoose';

interface IOption {
  text: string;
  isCorrect: boolean;
}

interface IQuestion {
  question: string;
  options: IOption[];
  explanation?: string;
}

export interface IQuiz extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  questions: IQuestion[];
  completed: boolean;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const questionSchema = new Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  explanation: { type: String }
});

const quizSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    questions: [questionSchema],
    completed: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema); 