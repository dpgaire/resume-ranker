import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Bot, Briefcase, Sparkles, ArrowRight, Download, RotateCcw, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/file-upload";
import { MatchScoreDisplay } from "@/components/match-score-display";
import { AnalysisSummary } from "@/components/analysis-summary";
import { useTheme } from "@/components/theme-provider";
import { apiRequest } from "@/lib/queryClient";

interface MatchResult {
  id: number;
  matchScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keywordMatch: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  summary: string;
  isAiGenerated: boolean;
  fallbackUsed?: boolean;
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Extract PDF text mutation
  const extractPdfMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await apiRequest('POST', '/api/extract-pdf', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setExtractedText(data.text);
      toast({
        title: "PDF processed successfully",
        description: "Resume text extracted and ready for analysis.",
      });
    },
    onError: (error) => {
      toast({
        title: "PDF processing failed",
        description: error.message,
        variant: "destructive",
      });
      setSelectedFile(null);
    },
  });

  // Match analysis mutation
  const matchMutation = useMutation({
    mutationFn: async ({ jobDescription, resumeText }: { jobDescription: string; resumeText: string }) => {
      const response = await apiRequest('POST', '/api/match', { jobDescription, resumeText });
      return response.json();
    },
    onSuccess: (data) => {
      setMatchResult(data);
      setShowResults(true);
      toast({
        title: "Analysis complete!",
        description: data.fallbackUsed 
          ? "Analysis completed using fallback algorithm (AI service unavailable)" 
          : "AI analysis completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    extractPdfMutation.mutate(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setExtractedText("");
  };

  const handleMatch = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter a job description.",
        variant: "destructive",
      });
      return;
    }

    if (!extractedText) {
      toast({
        title: "Resume required", 
        description: "Please upload your resume.",
        variant: "destructive",
      });
      return;
    }

    matchMutation.mutate({
      jobDescription: jobDescription.trim(),
      resumeText: extractedText,
    });
  };

  const handleTryAgain = () => {
    setShowResults(false);
    setMatchResult(null);
    setJobDescription("");
    setSelectedFile(null);
    setExtractedText("");
  };

  const isProcessing = extractPdfMutation.isPending || matchMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-morphism">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Resume Matcher</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Match your resume to any job description</p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-3 rounded-xl neumorphic hover:scale-105 transition-transform"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-purple-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          
          {/* Hero Section */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Perfect Resume Match
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how well your resume aligns with any job description using advanced AI analysis
            </p>
          </motion.div>

          {!showResults ? (
            <>
              {/* Main Input Section */}
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Job Description Input */}
                <motion.div
                  className="gradient-border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="gradient-border-inner p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Description</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Paste the job description you want to match against
                        </label>
                        <Textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          rows={12}
                          className="resize-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                          placeholder="Paste the job description here...

Example: We are looking for a Senior Software Engineer with experience in React, Node.js, and cloud technologies. The ideal candidate will have 5+ years of experience building scalable web applications..."
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Copy and paste the complete job posting for best results</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Resume Upload */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    selectedFile={selectedFile}
                    isProcessing={extractPdfMutation.isPending}
                  />
                </motion.div>
              </div>

              {/* Match Button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button
                  onClick={handleMatch}
                  disabled={isProcessing || !jobDescription.trim() || !extractedText}
                  className="px-12 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  size="lg"
                >
                  <motion.div
                    className="flex items-center space-x-3"
                    animate={!isProcessing ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{isProcessing ? "Processing..." : "Match Resume"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Analysis typically takes 10-15 seconds
                </p>
              </motion.div>

              {/* Loading State */}
              {isProcessing && (
                <motion.div
                  className="glass-morphism rounded-2xl p-8 text-center space-y-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analyzing Your Resume</h3>
                    <div className="space-y-3">
                      <motion.div
                        className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Extracting text from PDF...</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <Bot className="w-4 h-4" />
                        <span>Processing with AI...</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            matchResult && (
              <>
                {/* Results Section */}
                <MatchScoreDisplay
                  matchScore={matchResult.matchScore}
                  skillMatch={matchResult.skillMatch}
                  experienceMatch={matchResult.experienceMatch}
                  educationMatch={matchResult.educationMatch}
                  keywordMatch={matchResult.keywordMatch}
                />

                <AnalysisSummary
                  strengths={matchResult.strengths}
                  improvements={matchResult.improvements}
                  recommendations={matchResult.recommendations}
                  summary={matchResult.summary}
                  isAiGenerated={matchResult.isAiGenerated}
                  fallbackUsed={matchResult.fallbackUsed}
                />

                {/* Action Buttons */}
                <motion.div
                  className="flex justify-center space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                >
                  <Button
                    variant="outline"
                    className="px-6 py-3 rounded-xl flex items-center space-x-2"
                    onClick={() => window.print()}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </Button>
                  <Button
                    onClick={handleTryAgain}
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors duration-300 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Another Match</span>
                  </Button>
                </motion.div>
              </>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 glass-morphism">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2024 AI Resume Matcher. Powered by advanced AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
