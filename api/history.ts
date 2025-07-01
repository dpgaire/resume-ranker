import { Request, Response } from 'express';
import { DatabaseStorage } from '../server/db-storage';

const storage = new DatabaseStorage();

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const analyses = await storage.getAllMatchAnalyses();
    res.json(analyses);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve analysis history" 
    });
  }
}