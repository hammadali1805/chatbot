import { Request, Response } from 'express';
import { StudyPlan, IStudyPlan } from '../models/StudyPlan';
import mongoose from 'mongoose';

// Define AuthRequest type for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Define ITopic interface to match the model
interface ITopic {
  title: string;
  description?: string;
  completed: boolean;
  deadline?: Date;
  _id?: mongoose.Types.ObjectId;
  toObject?: () => any;
}

export class StudyPlanController {
  constructor() {
    // Bind all methods to this
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.updateTopic = this.updateTopic.bind(this);
    this.getByDateRange = this.getByDateRange.bind(this);
  }

  /**
   * Create a new study plan
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const studyPlanData = {
        ...req.body,
        user: req.user.id
      };

      const studyPlan = new StudyPlan(studyPlanData);
      await studyPlan.save();

      res.status(201).json(studyPlan);
    } catch (error: any) {
      console.error('Error creating study plan:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get all study plans for the authenticated user
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const studyPlans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json(studyPlans);
    } catch (error: any) {
      console.error('Error fetching study plans:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get a specific study plan by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const studyPlan = await StudyPlan.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!studyPlan) {
        res.status(404).json({ message: 'Study plan not found' });
        return;
      }

      res.status(200).json(studyPlan);
    } catch (error: any) {
      console.error('Error fetching study plan:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Update a study plan
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const studyPlan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id });

      if (!studyPlan) {
        res.status(404).json({ message: 'Study plan not found' });
        return;
      }

      // If topics are being updated
      if (req.body.topics) {
        // Update each topic while preserving other fields
        studyPlan.topics = req.body.topics.map((topic: ITopic) => {
          const existingTopic = studyPlan.topics.find(t => (t as any)._id.toString() === topic._id);
          if (existingTopic) {
            return {
              ...(existingTopic as any),
              ...topic,
              _id: (existingTopic as any)._id
            };
          }
          return topic;
        });
      }

      // Update other fields
      if (req.body.title) studyPlan.title = req.body.title;
      if (req.body.description !== undefined) studyPlan.description = req.body.description;
      if (req.body.startDate) studyPlan.startDate = new Date(req.body.startDate);
      if (req.body.endDate) studyPlan.endDate = new Date(req.body.endDate);

      // Save the study plan (this will trigger the pre-save hook to calculate progress)
      await studyPlan.save();

      res.status(200).json(studyPlan);
    } catch (error: any) {
      console.error('Error updating study plan:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Delete a study plan
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const studyPlan = await StudyPlan.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

      if (!studyPlan) {
        res.status(404).json({ message: 'Study plan not found' });
        return;
      }

      res.status(200).json({ message: 'Study plan deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting study plan:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Update a specific topic within a study plan
   */
  async updateTopic(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { id, topicId } = req.params;
      const studyPlan = await StudyPlan.findOne({ _id: id, user: req.user.id });

      if (!studyPlan) {
        res.status(404).json({ message: 'Study plan not found' });
        return;
      }

      // In Mongoose, when working with subdocuments in an array
      // We need to use type assertion since the ITopic interface doesn't include _id
      const topicIndex = studyPlan.topics.findIndex(
        topic => (topic as any)._id.toString() === topicId
      );

      if (topicIndex === -1) {
        res.status(404).json({ message: 'Topic not found' });
        return;
      }

      // Update the topic
      const topic = studyPlan.topics[topicIndex];
      if (req.body.title) topic.title = req.body.title;
      if (req.body.description !== undefined) topic.description = req.body.description;
      if (req.body.completed !== undefined) topic.completed = req.body.completed;
      if (req.body.deadline) topic.deadline = new Date(req.body.deadline);

      await studyPlan.save();
      res.status(200).json(studyPlan);
    } catch (error: any) {
      console.error('Error updating topic:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get study plans by date range
   */
  async getByDateRange(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ message: 'Start date and end date are required' });
        return;
      }

      const plans = await StudyPlan.find({
        user: req.user.id,
        startDate: { $gte: new Date(startDate as string) },
        endDate: { $lte: new Date(endDate as string) }
      }).sort({ startDate: 1 });

      res.status(200).json(plans);
    } catch (error: any) {
      console.error('Error getting study plans by date range:', error);
      res.status(500).json({ message: error.message });
    }
  }
} 