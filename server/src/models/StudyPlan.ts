import mongoose, { Document, Schema } from 'mongoose';

interface ITopic {
  title: string;
  description?: string;
  completed: boolean;
  deadline?: Date;
}

export interface IStudyPlan extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  topics: ITopic[];
  startDate: Date;
  endDate: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  deadline: { type: Date }
});

const studyPlanSchema = new Schema(
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
    topics: [topicSchema],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Calculate progress based on completed topics
studyPlanSchema.pre('save', function(next) {
  if (this.topics && this.topics.length > 0) {
    const completedTopics = this.topics.filter(topic => topic.completed).length;
    this.progress = Math.round((completedTopics / this.topics.length) * 100);
  } else {
    this.progress = 0;
  }
  next();
});

export const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', studyPlanSchema); 