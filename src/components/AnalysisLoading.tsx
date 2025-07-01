import React, { useState, useEffect } from 'react';
import { 
  CloudArrowUpIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  CogIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

interface AnalysisLoadingProps {
  currentStage: 'uploading' | 'analyzing' | 'processing' | 'complete';
  apiProvider: string;
  progress?: number;
  estimatedTime?: number;
  onComplete?: () => void;
}

interface LoadingStage {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  estimatedDuration: number;
}

const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  currentStage,
  apiProvider,
  progress,
  onComplete
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    "Our AI can identify thousands of different items and provide accurate market valuations based on current trends and historical data.",
    "For best results, ensure your image is well-lit and shows the item clearly from multiple angles.",
    "The AI analyzes brand markers, condition, and current market demand to estimate resale value.",
    "Complex analysis may take longer as our AI searches through extensive market data.",
    "Our system checks multiple marketplaces to provide you with the most accurate pricing information."
  ];

  const stages: LoadingStage[] = [
    {
      id: 'uploading',
      title: 'Uploading Image',
      icon: CloudArrowUpIcon,
      description: 'Securely uploading your image to cloud storage',
      estimatedDuration: 3
    },
    {
      id: 'analyzing',
      title: 'AI Analysis',
      icon: SparklesIcon,
      description: `Analyzing with ${apiProvider} AI technology`,
      estimatedDuration: 45
    },
    {
      id: 'processing',
      title: 'Processing Results',
      icon: CogIcon,
      description: 'Extracting insights and generating recommendations',
      estimatedDuration: 5
    },
    {
      id: 'complete',
      title: 'Complete',
      icon: CheckCircleIcon,
      description: 'Analysis complete! Displaying results...',
      estimatedDuration: 1
    }
  ];

  useEffect(() => {
    const stageIndex = stages.findIndex(stage => stage.id === currentStage);
    setCurrentStageIndex(stageIndex);
  }, [currentStage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % tips.length);
    }, 8000); // Change tip every 8 seconds

    return () => clearInterval(tipTimer);
  }, [tips.length]);

  useEffect(() => {
    if (currentStage === 'complete' && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStage, onComplete]);

  const calculateProgress = () => {
    if (progress !== undefined) return progress;
    
    const completedStages = currentStageIndex;
    const totalStages = stages.length;
    const baseProgress = (completedStages / totalStages) * 100;
    
    // Add progress within current stage based on elapsed time
    const currentStageProgress = Math.min(
      (elapsedTime / stages[currentStageIndex]?.estimatedDuration || 1) * 
      (100 / totalStages), 
      100 / totalStages
    );
    
    return Math.min(baseProgress + currentStageProgress, 100);
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds)}s`;
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="mb-8">
        <div className="relative">
          <LoadingSpinner size="xl" variant="ring" className="mx-auto mb-6" />
          <div className="absolute inset-0 flex items-center justify-center">
            <EyeIcon className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {stages[currentStageIndex]?.title || 'Processing...'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {stages[currentStageIndex]?.description || 'Please wait while we process your request...'}
          {currentStage === 'analyzing' && elapsedTime > 10 && (
            <span className="block text-sm mt-2 text-blue-600 dark:text-blue-400">
              Performing deep analysis with AI - this may take up to 90 seconds...
            </span>
          )}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${calculateProgress()}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          <span>{Math.round(calculateProgress())}% complete</span>
          <span>Elapsed: {formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const IconComponent = stage.icon;
          
          return (
            <div
              key={stage.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : isCurrent
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 animate-pulse'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <IconComponent 
                className={`h-6 w-6 mx-auto mb-2 ${
                  isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : isCurrent
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-600'
                }`} 
              />
              <p className={`text-xs font-medium ${
                isCompleted
                  ? 'text-green-700 dark:text-green-300'
                  : isCurrent
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {stage.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          💡 Did you know?
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200 transition-all duration-500">
          {tips[currentTipIndex]}
        </p>
      </div>
    </div>
  );
};

export default AnalysisLoading;
