import { matchAnalyses, type MatchAnalysis, type InsertMatchAnalysis } from "@shared/schema";

export interface IStorage {
  createMatchAnalysis(analysis: InsertMatchAnalysis): Promise<MatchAnalysis>;
  getMatchAnalysis(id: number): Promise<MatchAnalysis | undefined>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, MatchAnalysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async createMatchAnalysis(insertAnalysis: InsertMatchAnalysis): Promise<MatchAnalysis> {
    const id = this.currentId++;
    const analysis: MatchAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getMatchAnalysis(id: number): Promise<MatchAnalysis | undefined> {
    return this.analyses.get(id);
  }
}

export const storage = new MemStorage();
