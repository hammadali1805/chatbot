import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Note } from '../models/Note';

export class NoteController extends BaseController {
  constructor() {
    super(Note, 'Note');
  }

  // Search notes by title, content, or tags
  search = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { query } = req.query;

      const notes = await Note.find({
        user: userId,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query as string, 'i')] } }
        ]
      }).sort({ updatedAt: -1 });

      res.json(notes);
    } catch (error) {
      console.error('Error searching notes:', error);
      res.status(500).json({ message: 'Error searching notes' });
    }
  };
} 