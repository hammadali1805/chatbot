import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: {
      type: String,
      enum: ['query', 'quiz', 'study_plan', 'note', null],
      default: null
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'metadata.type',
      default: null
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', null],
      default: null
    }
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  context: {
    currentTopic: String,
    currentSubject: String,
    activeItems: [{
      type: {
        type: String,
        enum: ['quiz', 'study_plan', 'note']
      },
      id: mongoose.Schema.Types.ObjectId
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Chat = mongoose.model('Chat', chatSchema); 