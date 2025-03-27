import { Request, Response } from 'express';
import mongoose from 'mongoose';

export class BaseController {
  protected model: mongoose.Model<any>;
  protected modelName: string;

  constructor(model: mongoose.Model<any>, modelName: string) {
    this.model = model;
    this.modelName = modelName;
  }

  // Get all items for a user
  getAll = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const items = await this.model.find({ user: userId }).sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      console.error(`Error getting ${this.modelName}s:`, error);
      res.status(500).json({ message: `Error getting ${this.modelName}s` });
    }
  };

  // Get a single item
  getOne = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const item = await this.model.findOne({
        _id: req.params.id,
        user: userId
      });

      if (!item) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      res.json(item);
    } catch (error) {
      console.error(`Error getting ${this.modelName}:`, error);
      res.status(500).json({ message: `Error getting ${this.modelName}` });
    }
  };

  // Create a new item
  create = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const newItem = new this.model({
        ...req.body,
        user: userId
      });

      await newItem.save();
      res.status(201).json(newItem);
    } catch (error) {
      console.error(`Error creating ${this.modelName}:`, error);
      res.status(500).json({ message: `Error creating ${this.modelName}` });
    }
  };

  // Update an item
  update = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const updatedItem = await this.model.findOneAndUpdate(
        { _id: req.params.id, user: userId },
        { $set: req.body },
        { new: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error(`Error updating ${this.modelName}:`, error);
      res.status(500).json({ message: `Error updating ${this.modelName}` });
    }
  };

  // Delete an item
  delete = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const deletedItem = await this.model.findOneAndDelete({
        _id: req.params.id,
        user: userId
      });

      if (!deletedItem) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      res.json({ message: `${this.modelName} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${this.modelName}:`, error);
      res.status(500).json({ message: `Error deleting ${this.modelName}` });
    }
  };
} 