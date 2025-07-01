import { Request, Response } from 'express';
import multer from 'multer';
import { PDFExtractor } from '../server/services/pdf-extractor';

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

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use multer middleware
  upload.single('resume')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      const extractedText = await PDFExtractor.extractText(file.buffer);
      
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
}