import React, { useState, useRef } from 'react';
import { CameraIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { analyzeImageWithGeminiAPI, uploadImageDirectly } from '../services/apiService';
import { AnalysisResult } from '../types';
import ImageUpload from '../components/ImageUpload';
import ResultCard from '../components/ResultCard';
import AnalysisLoading from '../components/AnalysisLoading';
import LoadingSpinner from '../components/LoadingSpinner';

const CameraPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingStage, setLoadingStage] = useState<'uploading' | 'analyzing' | 'processing' | 'complete'>('uploading');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      showToast('error', 'Camera access denied', 'Please allow camera access to take photos.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleImageSelected(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    setLoadingStage('uploading');

    try {
      // Upload image first
      const imageUrl = await uploadImageDirectly(selectedImage);
      setIsUploading(false);
      setLoadingStage('analyzing');
      
      // Then analyze with Gemini
      const result = await analyzeImageWithGeminiAPI(imageUrl);
      setLoadingStage('processing');
      
      // Brief processing stage
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingStage('complete');
      
      setAnalysisResult(result);
      showToast('success', 'Analysis complete!', 'Your image has been analyzed successfully.');
    } catch (error) {
      showToast('error', 'Analysis failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setIsUploading(false);
    setIsAnalyzing(false);
    setLoadingStage('uploading');
    stopCamera();
  };

  if (analysisResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Results
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
        apiProvider="Gemini AI"
        onComplete={() => {
          // Will automatically hide when stage changes to complete
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <CameraIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Item Analysis
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Take a photo or upload an image to get instant AI-powered value estimation
        </p>
      </div>

      {/* Camera Section */}
      {isCameraActive ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={capturePhoto}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
              >
                <CameraIcon className="h-6 w-6" />
              </button>
              <button
                onClick={stopCamera}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startCamera}
              className="btn btn-primary flex items-center justify-center space-x-2"
            >
              <CameraIcon className="h-5 w-5" />
              <span>Open Camera</span>
            </button>

            {selectedImage && (
              <button
                onClick={analyzeImage}
                disabled={isUploading || isAnalyzing}
                className="btn btn-success flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <PhotoIcon className="h-5 w-5" />
                    <span>Analyze with Gemini AI</span>
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CameraPage;