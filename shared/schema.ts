import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const matchAnalyses = pgTable("match_analyses", {
  id: serial("id").primaryKey(),
  jobDescription: text("job_description").notNull(),
  resumeText: text("resume_text").notNull(),
  matchScore: integer("match_score").notNull(),
  skillMatch: integer("skill_match").notNull(),
  experienceMatch: integer("experience_match").notNull(),
  educationMatch: integer("education_match").notNull(),
  keywordMatch: integer("keyword_match").notNull(),
  strengths: text("strengths").array().notNull(),
  improvements: text("improvements").array().notNull(),
  recommendations: text("recommendations").array().notNull(),
  summary: text("summary").notNull(),
  isAiGenerated: boolean("is_ai_generated").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMatchAnalysisSchema = createInsertSchema(matchAnalyses).omit({
  id: true,
  createdAt: true,
});

export const matchRequestSchema = z.object({
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long"),
  resumeText: z.string().min(100, "Resume text must be at least 100 characters long"),
});

export const apiSettingsSchema = z.object({
  openaiKey: z.string().optional(),
  openrouterKey: z.string().optional(),
  claudeKey: z.string().optional(),
  preferredProvider: z.enum(["openai", "openrouter", "claude"]).default("openrouter"),
});

export type InsertMatchAnalysis = z.infer<typeof insertMatchAnalysisSchema>;
export type MatchAnalysis = typeof matchAnalyses.$inferSelect;
export type MatchRequest = z.infer<typeof matchRequestSchema>;
export type ApiSettings = z.infer<typeof apiSettingsSchema>;
