import React, { useState, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { AnalysisResult, ApiProvider } from '../../types';
import { uploadImageDirectly } from '../../services/apiService';
import { scanService } from '../../services/scanService';
import { statsEmitter } from '../../utils/statsEmitter';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import ImageUpload from '../../components/ImageUpload';
import ResultCard from '../../components/ResultCard';
import AnalysisLoading from '../../components/AnalysisLoading';
import LoadingSpinner from '../../components/LoadingSpinner';

interface AnalysisPageBaseProps {
  apiProvider: ApiProvider;
  analyzeFunction: (imageUrl: string) => Promise<AnalysisResult>;
  pageTitle: string;
  pageDescription: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AnalysisPageBase: React.FC<AnalysisPageBaseProps> = ({
  apiProvider,
  analyzeFunction,
  pageTitle,
  pageDescription,
  icon: Icon,
}) => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<'uploading' | 'analyzing' | 'processing' | 'complete'>('uploading');

  const handleImageSelected = useCallback((file: File) => {
    setSelectedImage(file);
    setError(null);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    setError(null);
    setLoadingStage('uploading');

    try {
      // Upload image first
      const imageUrl = await uploadImageDirectly(selectedImage);
      setIsUploading(false);
      setLoadingStage('analyzing');
      
      // Then analyze
      const result = await analyzeFunction(imageUrl);
      setLoadingStage('processing');
      
      // Brief processing stage
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingStage('complete');
      
      setAnalysisResult(result);
      
      // Save to database if user is authenticated
      if (isAuthenticated) {
        try {
          await scanService.createScan({
            title: result.title,
            description: result.description,
            value: result.value,
            aiExplanation: result.aiExplanation,
            imageUrl: imageUrl,
            apiProvider: apiProvider,
            visualMatches: result.visualMatches,
          });
          
          // Emit stats refresh event
          statsEmitter.emit();
        } catch (saveError) {
          console.error('Failed to save scan:', saveError);
          // Don't show error for save failure, just log it
        }
      }
      
      showToast('success', `${apiProvider} Analysis Complete!`, 'Your image has been analyzed successfully.');
    } catch (err) {
      console.error(`Error analyzing with ${apiProvider}:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to analyze image with ${apiProvider}.`;
      setError(errorMessage);
      showToast('error', 'Analysis Failed', errorMessage);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }, [selectedImage, analyzeFunction, apiProvider, showToast, isAuthenticated, setLoadingStage]);

  const resetAnalysis = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    setIsUploading(false);
    setIsAnalyzing(false);
  }, []);

  if (analysisResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {apiProvider} Analysis Results
          </h1>
          <button
            onClick={resetAnalysis}
            className="btn btn-primary flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Analyze Another</span>
          </button>
        </div>
        <ResultCard result={analysisResult} />
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <AnalysisLoading 
        currentStage={loadingStage}
        apiProvider={apiProvider}
        onComplete={() => {
          // Will automatically hide when stage changes to complete
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <Icon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {pageTitle}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {pageDescription}
        </p>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <img
            src={imagePreview}
            alt="Selected"
            className="w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Upload Section */}
      <ImageUpload
        onImageSelected={handleImageSelected}
        isUploading={isUploading}
        className="max-w-2xl mx-auto"
      />

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Analysis Failed
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={resetAnalysis}
                  className="text-sm bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {selectedImage && !error && (
        <div className="text-center">
          <button
            onClick={analyzeImage}
            disabled={isUploading || isAnalyzing}
            className="btn btn-success text-lg px-8 py-3 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Uploading...
              </>
            ) : (
              `Analyze with ${apiProvider}`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisPageBase;