import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Rocket, Lightbulb, ArrowRight } from "lucide-react";

interface AnalysisSummaryProps {
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  summary: string;
  isAiGenerated: boolean;
  fallbackUsed?: boolean;
}

export function AnalysisSummary({ 
  strengths, 
  improvements, 
  recommendations, 
  summary, 
  isAiGenerated,
  fallbackUsed 
}: AnalysisSummaryProps) {
  return (
    <motion.div
      className="glass-morphism rounded-2xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isAiGenerated ? 'AI Analysis Summary' : 'Analysis Summary'}
          </h3>
        </div>
        {fallbackUsed && (
          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
            Fallback Analysis
          </span>
        )}
      </div>

      {/* Summary */}
      <motion.div
        className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-blue-800 dark:text-blue-200">{summary}</p>
      </motion.div>
      
      <div className="space-y-6">
        
        {/* Strengths */}
        <motion.div
          className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800 dark:text-green-200">Strong Matches</h4>
          </div>
          <ul className="space-y-2 text-green-700 dark:text-green-300">
            {strengths.map((strength, index) => (
              <motion.li
                key={index}
                className="flex items-start space-x-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <ArrowRight className="w-3 h-3 mt-1.5 flex-shrink-0" />
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Areas for Improvement */}
        {improvements.length > 0 && (
          <motion.div
            className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Areas to Highlight</h4>
            </div>
            <ul className="space-y-2 text-yellow-700 dark:text-yellow-300">
              {improvements.map((improvement, index) => (
                <motion.li
                  key={index}
                  className="flex items-start space-x-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                >
                  <ArrowRight className="w-3 h-3 mt-1.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="flex items-center space-x-2 mb-3">
            <Rocket className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Recommendations</h4>
          </div>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            {recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                className="flex items-start space-x-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <ArrowRight className="w-3 h-3 mt-1.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
