import mongoose, { Document, Schema } from 'mongoose';

interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type: 'query' | 'quiz' | 'study_plan' | 'note' | null;
    referenceId?: mongoose.Types.ObjectId;
    action?: 'create' | 'update' | 'delete' | null;
  };
}

interface IChatContext {
  currentTopic?: string;
  currentSubject?: string;
  activeItems?: Array<{
    type: 'quiz' | 'study_plan' | 'note';
    id: mongoose.Types.ObjectId;
  }>;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  context?: IChatContext;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema({
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
      type: String,
      validate: {
        validator: function(v: any) {
          return v === null || v === undefined || (typeof v === 'string' && v.length > 0);
        },
        message: 'Invalid referenceId'
      },
      default: null
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', null],
      default: null
    }
  }
});

const chatSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
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
      id: {
        type: Schema.Types.ObjectId,
        refPath: 'context.activeItems.type',
        validate: {
          validator: function(v: any) {
            // Check if it's a valid ObjectId or can be converted to one
            try {
              return v instanceof mongoose.Types.ObjectId || 
                     mongoose.Types.ObjectId.isValid(v);
            } catch (e) {
              return false;
            }
          },
          message: 'Invalid ObjectId'
        }
      }
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

// Update the updatedAt timestamp before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 