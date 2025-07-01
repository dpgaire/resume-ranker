import { matchAnalyses, type MatchAnalysis, type InsertMatchAnalysis } from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async createMatchAnalysis(analysis: InsertMatchAnalysis): Promise<MatchAnalysis> {
    const [created] = await db
      .insert(matchAnalyses)
      .values({
        ...analysis,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async getMatchAnalysis(id: number): Promise<MatchAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(matchAnalyses)
      .where(eq(matchAnalyses.id, id));
    return analysis || undefined;
  }

  async getAllMatchAnalyses(): Promise<MatchAnalysis[]> {
    return await db
      .select()
      .from(matchAnalyses)
      .orderBy(desc(matchAnalyses.createdAt));
  }
}