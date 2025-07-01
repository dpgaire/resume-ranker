import { matchAnalyses, type MatchAnalysis, type InsertMatchAnalysis } from "@shared/schema";

export interface IStorage {
  createMatchAnalysis(analysis: InsertMatchAnalysis): Promise<MatchAnalysis>;
  getMatchAnalysis(id: number): Promise<MatchAnalysis | undefined>;
  getAllMatchAnalyses(): Promise<MatchAnalysis[]>;
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
      isAiGenerated: insertAnalysis.isAiGenerated ?? true,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getMatchAnalysis(id: number): Promise<MatchAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getAllMatchAnalyses(): Promise<MatchAnalysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const storage = new MemStorage();
