import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MatchScoreDisplayProps {
  matchScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keywordMatch: number;
}

export function MatchScoreDisplay({ 
  matchScore, 
  skillMatch, 
  experienceMatch, 
  educationMatch, 
  keywordMatch 
}: MatchScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = matchScore / 50;
      const scoreTimer = setInterval(() => {
        current += increment;
        if (current >= matchScore) {
          current = matchScore;
          clearInterval(scoreTimer);
        }
        setAnimatedScore(Math.round(current));
      }, 40);

      return () => clearInterval(scoreTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [matchScore]);

  const scoreToAngle = (score: number) => (score / 100) * 360;

  return (
    <motion.div
      className="glass-morphism rounded-2xl p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Match Score</h3>
      
      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 90 - (scoreToAngle(animatedScore) / 360) * 2 * Math.PI * 90 
              }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-primary-600 dark:text-primary-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {animatedScore}
              </motion.div>
              <div className="text-lg text-gray-600 dark:text-gray-300">out of 100</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Score Breakdown */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <motion.div 
            className="text-2xl font-bold text-green-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            {skillMatch}%
          </motion.div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Skills Match</div>
        </div>
        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <motion.div 
            className="text-2xl font-bold text-blue-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
          >
            {experienceMatch}%
          </motion.div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Experience</div>
        </div>
        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <motion.div 
            className="text-2xl font-bold text-purple-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6 }}
          >
            {educationMatch}%
          </motion.div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Education</div>
        </div>
        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <motion.div 
            className="text-2xl font-bold text-orange-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
          >
            {keywordMatch}%
          </motion.div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Keywords</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
