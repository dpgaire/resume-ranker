import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { History, Clock, Sparkles, TrendingUp, Calendar, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getQueryFn } from "@/lib/queryClient";
import type { MatchAnalysis } from "@shared/schema";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAnalysis: (analysis: MatchAnalysis) => void;
}

export function HistoryModal({ isOpen, onClose, onViewAnalysis }: HistoryModalProps) {
  const { data: history, isLoading } = useQuery<MatchAnalysis[]>({
    queryKey: ['/api/history'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isOpen,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Analysis History</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : !history || history.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Analysis History
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start analyzing resumes to see your history here.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {history.map((analysis: MatchAnalysis, index: number) => (
                <motion.div
                  key={analysis.id}
                  className="glass-morphism rounded-lg p-4 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onViewAnalysis(analysis)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(analysis.createdAt.toString())}
                        </span>
                      </div>
                      <Badge variant={analysis.isAiGenerated ? "default" : "secondary"} className="text-xs">
                        {analysis.isAiGenerated ? (
                          <Sparkles className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        )}
                        {analysis.isAiGenerated ? "AI Analysis" : "Text Similarity"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                        {analysis.matchScore}%
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        Job Description Preview
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {truncateText(analysis.jobDescription, 120)}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-600">
                          {analysis.skillMatch}%
                        </div>
                        <div className="text-xs text-gray-500">Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-blue-600">
                          {analysis.experienceMatch}%
                        </div>
                        <div className="text-xs text-gray-500">Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-purple-600">
                          {analysis.educationMatch}%
                        </div>
                        <div className="text-xs text-gray-500">Education</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-orange-600">
                          {analysis.keywordMatch}%
                        </div>
                        <div className="text-xs text-gray-500">Keywords</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}