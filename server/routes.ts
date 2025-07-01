import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";

// Extend Request interface to include file
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}
import { storage } from "./storage";
import { matchRequestSchema, apiSettingsSchema } from "@shared/schema";
import { PDFExtractor } from "./services/pdf-extractor";
import { OpenRouterClient } from "./services/openrouter-client";
import { TextSimilarityAnalyzer } from "./services/text-similarity";
import { AIProvider } from "./services/ai-provider";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Extract text from PDF
  app.post("/api/extract-pdf", upload.single('resume'), async (req: RequestWithFile, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      const extractedText = await PDFExtractor.extractText(req.file.buffer);
      
      if (!extractedText || extractedText.length < 50) {
        return res.status(400).json({ 
          message: "Could not extract sufficient text from PDF. Please ensure the PDF contains readable text." 
        });
      }

      res.json({ text: extractedText });
    } catch (error) {
      console.error("PDF extraction error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to extract text from PDF" 
      });
    }
  });

  // Analyze resume match with configurable AI provider
  app.post("/api/match", async (req, res) => {
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
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }

      const analysis = await storage.getMatchAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve analysis" 
      });
    }
  });

  // Get all analyses (history)
  app.get("/api/history", async (req, res) => {
    try {
      const analyses = await storage.getAllMatchAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Get history error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve analysis history" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
