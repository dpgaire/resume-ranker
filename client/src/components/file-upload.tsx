import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isProcessing?: boolean;
}

export function FileUpload({ onFileSelect, onFileRemove, selectedFile, isProcessing }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile && pdfFile.size <= 10 * 1024 * 1024) {
      onFileSelect(pdfFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('file',file)
    if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="gradient-border h-full">
      <div className="gradient-border-inner p-6 h-full">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Resume</h3>
          </div>
          
          {!selectedFile ? (
            <motion.div
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                ${isDragOver 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Drop your resume here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or click to browse files</p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>PDF files only, max 10MB</span>
                </div>
              </motion.div>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">{selectedFile.name}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <button
                  onClick={onFileRemove}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
