import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { matchRequestSchema } from "@shared/schema";
import { PDFExtractor } from "./services/pdf-extractor";
import { OpenRouterClient } from "./services/openrouter-client";
import { TextSimilarityAnalyzer } from "./services/text-similarity";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Extract text from PDF
  app.post("/api/extract-pdf", upload.single('resume'), async (req, res) => {
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

  // Analyze resume match
  app.post("/api/match", async (req, res) => {
    try {
      const { jobDescription, resumeText } = matchRequestSchema.parse(req.body);

      let analysisResult;
      let isAiGenerated = true;

      try {
        // Try OpenRouter API first
        const openRouterClient = new OpenRouterClient();
        analysisResult = await openRouterClient.analyzeMatch(jobDescription, resumeText);
      } catch (error) {
        console.warn("OpenRouter API failed, falling back to text similarity:", error);
        // Fallback to text similarity
        analysisResult = TextSimilarityAnalyzer.analyzeMatch(jobDescription, resumeText);
        isAiGenerated = false;
      }

      // Store the analysis
      const analysis = await storage.createMatchAnalysis({
        jobDescription,
        resumeText,
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

  const httpServer = createServer(app);
  return httpServer;
}
