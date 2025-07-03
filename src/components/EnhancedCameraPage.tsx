import React, { useState, useRef, useCallback } from 'react';
import { CameraIcon, PhotoIcon, ArrowPathIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { analyzeImageWithGeminiAPI, uploadImageDirectly } from '../services/apiService';
import { AnalysisResult } from '../types';
import { EnhancedImageResult } from '../types/imageEnhancements';
import ImageComparisonModal from './ImageComparisonModal';
import ResultCard from './ResultCard';
import AnalysisLoading from './AnalysisLoading';

const EnhancedCameraPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingStage, setLoadingStage] = useState<'uploading' | 'analyzing' | 'processing' | 'complete'>('uploading');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  // Load enhancement setting from localStorage, default to true
  const [useEnhancements, setUseEnhancements] = useState(() => {
    const saved = localStorage.getItem('cameraEnhancementsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save enhancement setting to localStorage when it changes
  const handleEnhancementToggle = (enabled: boolean) => {
    setUseEnhancements(enabled);
    localStorage.setItem('cameraEnhancementsEnabled', JSON.stringify(enabled));
  };

  // Comparison modal state
  const [showComparison, setShowComparison] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancedImageResult | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState(false);

  const handleImageSelected = async (file: File) => {
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // If enhancements are enabled, automatically trigger the enhancement process
    if (useEnhancements) {
      try {
        console.log('🎨 Auto-triggering image enhancement after capture...');
        showToast('info', 'Enhancing Image...', 'Applying automatic enhancements to improve analysis quality.');
        
        // Get saved enhancement settings from localStorage
        const savedSettings = localStorage.getItem('imageEnhancementSettings');
        const defaultSettings = {
          autoRotation: true,
          backgroundRemoval: true,
          dimensionMeasurement: true,
          qualityEnhancement: false
        };
        const enhancementSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
        
        // Import and use the enhancement service
        const { imageEnhancementService } = await import('../services/imageEnhancementService');
        const result = await imageEnhancementService.enhanceImage(file, enhancementSettings);
        
        // Show the comparison modal
        handleEnhancedImageReady(result);
      } catch (error) {
        console.error('Auto-enhancement failed:', error);
        showToast('error', 'Enhancement Failed', 'Could not enhance image. You can still proceed with the original image.');
      }
    }
  };

  const handleEnhancedImageReady = (result: EnhancedImageResult) => {
    console.log('Enhanced image result:', result);
    setEnhancementResult(result);
    setShowComparison(true);
  };

  const handleComparisonConfirm = (useEnhanced: boolean) => {
    if (!enhancementResult) return;
    
    setPendingAnalysis(true);
    setShowComparison(false);
    
    // Use the selected image (enhanced or original)
    const imageToUse = useEnhanced ? enhancementResult.processedImage : enhancementResult.originalImage;
    
    // Convert the selected image to a File
    fetch(imageToUse)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `${useEnhanced ? 'enhanced' : 'original'}-${Date.now()}.png`, { 
          type: blob.type || 'image/png' 
        });
        setSelectedImage(file);
        setImagePreview(imageToUse);
        setPendingAnalysis(false);
        
        const enhancementMsg = useEnhanced && enhancementResult.appliedEnhancements?.length 
          ? ` (${enhancementResult.appliedEnhancements.join(', ')})`
          : '';
        
        showToast('success', `${useEnhanced ? 'Enhanced' : 'Original'} Image Selected`, 
          `Ready for analysis${enhancementMsg}`);
      })
      .catch(error => {
        console.error('Failed to process selected image:', error);
        setPendingAnalysis(false);
        showToast('error', 'Error', 'Failed to process selected image');
      });
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (isAnalyzing) {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
    if (cameraStream) {
      stopCamera();
    }
    showToast('info', 'Image Cleared', 'You can now select a new image.');
  };

  const startCamera = useCallback(async () => {
    try {
      console.log('🎥 Starting camera...');
      setIsCameraActive(true);
      
      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }
      
      // Get camera stream with current facing mode
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      videoRef.current.srcObject = stream;
      setCameraStream(stream);
      
      await videoRef.current.play();
      console.log('🎥 Camera started successfully');
      
    } catch (error) {
      console.error('🎥 Camera error:', error);
      setIsCameraActive(false);
      showToast('error', 'Camera Error', 'Could not access camera. Please check permissions.');
    }
  }, [facingMode, showToast]);

  const stopCamera = useCallback(() => {
    console.log('🎥 Stopping camera...');
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isCameraActive) {
      stopCamera();
      // Restart camera with new facing mode will happen due to useEffect
      setTimeout(startCamera, 100);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      showToast('error', 'Capture Error', 'Camera not ready for capture.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      showToast('error', 'Capture Error', 'Could not get canvas context.');
      return;
    }

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { 
          type: 'image/jpeg' 
        });
        handleImageSelected(file);
        stopCamera();
        showToast('success', 'Photo Captured', 'Image captured successfully!');
      } else {
        showToast('error', 'Capture Error', 'Failed to capture image.');
      }
    }, 'image/jpeg', 0.8);
  }, [showToast, stopCamera]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelected(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      showToast('error', 'No Image', 'Please select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setIsUploading(true);
    setLoadingStage('uploading');

    try {
      // Upload image
      const uploadResult = await uploadImageDirectly(selectedImage);
      console.log('Upload result:', uploadResult);
      
      setLoadingStage('analyzing');
      setIsUploading(false);

      // Analyze with Gemini
      const analysisResult = await analyzeImageWithGeminiAPI(uploadResult);
      console.log('Analysis result:', analysisResult);

      setAnalysisResult(analysisResult);
      setLoadingStage('complete');
      setIsAnalyzing(false);
      
      showToast('success', 'Analysis Complete', 'Your image has been analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      setIsUploading(false);
      showToast('error', 'Analysis Failed', 'Could not analyze the image. Please try again.');
    }
  };

  // Show analysis result
  if (analysisResult) {
    return (
      <div className="mobile-card max-w-4xl mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Result</h2>
          <button
            onClick={clearSelectedImage}
            className="touch-target p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 touch-feedback rounded-lg"
            aria-label="Close result"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <ResultCard result={analysisResult} />
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={clearSelectedImage}
            className="btn-mobile w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"
          >
            <CameraIcon className="h-5 w-5 mr-2" />
            Analyze Another Item
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AnalysisLoading 
          currentStage={loadingStage}
          apiProvider="Gemini"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <CameraIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Item Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Take a photo or upload an image to get instant AI-powered analysis
          </p>
        </div>
      </div>

      {/* Camera View */}
      {isCameraActive && (
        <div className="relative mobile-card overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto bg-black"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Camera Controls */}
          <div className="mobile-camera-controls">
            <button
              onClick={switchCamera}
              className="camera-secondary-button"
              aria-label="Switch camera"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={capturePhoto}
              className="camera-button"
              aria-label="Take photo"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
            </button>
            
            <button
              onClick={stopCamera}
              className="camera-secondary-button"
              aria-label="Close camera"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && !isCameraActive && (
        <div className="mobile-card overflow-hidden">
          <img
            src={imagePreview}
            alt="Selected item"
            className="w-full h-auto"
          />
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <button
                onClick={analyzeImage}
                className="btn-mobile flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Analyze Image
              </button>
              <button
                onClick={clearSelectedImage}
                className="btn-mobile px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl"
                aria-label="Remove image"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!imagePreview && !isCameraActive && (
        <div className="space-y-4">
          {/* Camera Button */}
          <button
            onClick={startCamera}
            className="btn-mobile w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3"
          >
            <CameraIcon className="h-6 w-6" />
            <span>Open Camera</span>
          </button>
          
          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          
          {/* Upload Button */}
          <button
            onClick={handleFileSelect}
            className="btn-mobile w-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 py-4 px-6 rounded-xl flex items-center justify-center space-x-3"
          >
            <PhotoIcon className="h-6 w-6" />
            <span>Upload from Gallery</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Enhancement Toggle */}
      <div className="mobile-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Image Enhancement</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Automatically enhance images for better analysis
            </p>
          </div>
          <button
            onClick={() => handleEnhancementToggle(!useEnhancements)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useEnhancements ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useEnhancements ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showComparison && enhancementResult && (
        <ImageComparisonModal
          isOpen={showComparison}
          enhancementResult={enhancementResult}
          onConfirm={handleComparisonConfirm}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

export default EnhancedCameraPage;
