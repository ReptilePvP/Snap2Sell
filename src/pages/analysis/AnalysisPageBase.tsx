import React, { useState, useCallback } from 'react';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AnalysisResult, ApiProvider } from '../../types';
import { uploadImageDirectly } from '../../services/apiService';
import { scanService } from '../../services/scanService';
import { statsEmitter } from '../../utils/statsEmitter';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import EnhancedImageUpload from '../../components/EnhancedImageUpload';
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
  const [useEnhancements, setUseEnhancements] = useState(() => {
    const saved = localStorage.getItem('analysisEnhancementsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleEnhancementToggle = (enabled: boolean) => {
    setUseEnhancements(enabled);
    localStorage.setItem('analysisEnhancementsEnabled', JSON.stringify(enabled));
  };

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

  const handleEnhancedImageSelected = useCallback((file: File, enhancementData?: any) => {
    setSelectedImage(file);
    setError(null);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (enhancementData) {
      console.log('Enhancement data:', enhancementData);
      showToast('success', 'Image Enhanced!', 'Image has been automatically enhanced for better analysis.');
    }
  }, [showToast]);

  const handleEnhancedImageReady = useCallback((result: any) => {
    console.log('Enhanced image result:', result);
    
    // If the result contains an enhanced image, use it
    if (result.enhancedImage) {
      // Convert the enhanced image data URL to a File
      fetch(result.enhancedImage)
        .then(res => res.blob())
        .then(blob => {
          const enhancedFile = new File([blob], `enhanced-${Date.now()}.png`, { type: 'image/png' });
          setSelectedImage(enhancedFile);
          setImagePreview(result.enhancedImage);
          showToast('success', 'Image Processing Complete!', 
            `Enhancements applied: ${result.appliedEnhancements?.join(', ') || 'Multiple'}`);
        })
        .catch(error => {
          console.error('Failed to process enhanced image:', error);
        });
    }
  }, [showToast]);

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

  const clearSelectedImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    if (isAnalyzing) {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
    showToast('info', 'Image Cleared', 'You can now select a new image.');
  }, [isAnalyzing, showToast]);

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
          <div className="relative">
            <img
              src={imagePreview}
              alt="Selected"
              className="w-full max-h-96 object-contain rounded-lg"
            />
            {/* Clear/Remove Image Button */}
            <button
              onClick={clearSelectedImage}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors"
              title="Remove image"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={clearSelectedImage}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove Image & Start Over
            </button>
          </div>
        </div>
      )}

      {/* Upload Section with Enhancement Toggle */}
      <div className="space-y-6">
        {/* Enhancement Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Image Enhancements
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auto-rotation, background removal, and dimension measurement
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useEnhancements}
                onChange={(e) => handleEnhancementToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Enhanced Image Upload */}
        {useEnhancements ? (
          <EnhancedImageUpload
            onImageSelected={handleEnhancedImageSelected}
            onEnhancedImageReady={handleEnhancedImageReady}
            isUploading={isUploading}
            className="max-w-2xl mx-auto"
          />
        ) : (
          <div className="max-w-2xl mx-auto">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 ${
                isUploading ? 'pointer-events-none opacity-50' : ''
              }`}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImageSelected(file);
                };
                input.click();
              }}
            >
              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <LoadingSpinner size="lg" className="mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Uploading image...
                    </p>
                  </div>
                ) : (
                  <>
                    <Icon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Click to select an image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Basic upload without enhancements
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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