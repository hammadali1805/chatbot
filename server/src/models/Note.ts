import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema(
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
    content: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

// Create text index for search functionality
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Note = mongoose.model<INote>('Note', noteSchema); 