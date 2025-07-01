import { Request, Response } from 'express';
import { matchRequestSchema, apiSettingsSchema } from '../shared/schema';
import { OpenRouterClient } from '../server/services/openrouter-client';
import { TextSimilarityAnalyzer } from '../server/services/text-similarity';
import { AIProvider } from '../server/services/ai-provider';
import { DatabaseStorage } from '../server/db-storage';
import { z } from 'zod';

const storage = new DatabaseStorage();

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { jobDescription, resumeText, apiSettings } = req.body;
    const validatedRequest = matchRequestSchema.parse({ jobDescription, resumeText });

    let analysisResult;
    let isAiGenerated = true;

    try {
      if (apiSettings) {
        // Use user-configured AI provider
        const validatedSettings = apiSettingsSchema.parse(apiSettings);
        const aiProvider = new AIProvider(validatedSettings);
        analysisResult = await aiProvider.analyzeMatch(validatedRequest.jobDescription, validatedRequest.resumeText);
      } else {
        // Fallback to default OpenRouter
        const openRouterClient = new OpenRouterClient();
        analysisResult = await openRouterClient.analyzeMatch(validatedRequest.jobDescription, validatedRequest.resumeText);
      }
    } catch (error) {
      console.warn("AI provider failed, falling back to text similarity:", error);
      // Fallback to text similarity
      analysisResult = TextSimilarityAnalyzer.analyzeMatch(validatedRequest.jobDescription, validatedRequest.resumeText);
      isAiGenerated = false;
    }

    // Store the analysis
    const analysis = await storage.createMatchAnalysis({
      jobDescription: validatedRequest.jobDescription,
      resumeText: validatedRequest.resumeText,
      matchScore: analysisResult.matchScore,
      skillMatch: analysisResult.skillMatch,
      experienceMatch: analysisResult.experienceMatch,
      educationMatch: analysisResult.educationMatch,
      keywordMatch: analysisResult.keywordMatch,
      strengths: analysisResult.strengths,
      improvements: analysisResult.improvements,
      recommendations: analysisResult.recommendations,
      summary: analysisResult.summary,
      isAiGenerated,
    });

    res.json({
      ...analysis,
      fallbackUsed: !isAiGenerated
    });
  } catch (error) {
    console.error("Match analysis error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid input data", 
        errors: error.errors 
      });
    }

    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to analyze resume match" 
    });
  }
}