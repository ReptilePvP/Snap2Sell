import React, { useState, useRef } from 'react';
import { CameraIcon, PhotoIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { analyzeImageWithGeminiAPI, uploadImageDirectly } from '../services/apiService';
import { AnalysisResult } from '../types';
import { EnhancedImageResult } from '../types/imageEnhancements';
import EnhancedImageUpload from '../components/EnhancedImageUpload';
import ImageComparisonModal from '../components/ImageComparisonModal';
import ResultCard from '../components/ResultCard';
import AnalysisLoading from '../components/AnalysisLoading';
import LoadingSpinner from '../components/LoadingSpinner';
import PullToRefresh from '../components/PullToRefresh';
import MobileButton from '../components/MobileButton';

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

  const handleEnhancedImageSelected = (file: File, enhancementData?: any) => {
    setSelectedImage(file);
    
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
  };

  const handleEnhancedImageReady = (result: EnhancedImageResult) => {
    console.log('Enhanced image result:', result);
    setEnhancementResult(result);
    
    // Show comparison modal for user to choose
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
    showToast('info', 'Image Cleared', 'You can now select a new image.');
  };

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      console.log('🎥 Video element check before start:', !!videoRef.current);
      
      // Set camera active first to render the video element
      setIsCameraActive(true);
      
      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🎥 Video element check after render:', !!videoRef.current);
      
      if (!videoRef.current) {
        throw new Error('Video element still not available after render');
      }
      
      // Now get the camera stream
      let stream;
      try {
        console.log('🎥 Trying back camera (environment)...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (error) {
        // Fallback to front camera or any available camera (laptops)
        console.log('🎥 Back camera not available, trying front camera...');
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
        } catch (userError) {
          // Final fallback - any camera
          console.log('🎥 Specific camera modes failed, trying any camera...');
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true
          });
        }
      }
      
      console.log('🎥 Stream obtained:', stream);
      console.log('🎥 Stream tracks:', stream.getTracks());
      console.log('🎥 Video element check:', !!videoRef.current);
      
      if (videoRef.current && stream) {
        console.log('🎥 Setting stream to video element...');
        console.log('🎥 Video element exists:', !!videoRef.current);
        console.log('🎥 Stream active:', stream.active);
        console.log('🎥 Stream tracks active:', stream.getTracks().map(t => t.enabled));
        
        videoRef.current.srcObject = stream;
        
        // Wait for video to load metadata
        const waitForVideo = new Promise((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not available after wait'));
            return;
          }

          const timeout = setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000);

          video.onloadedmetadata = () => {
            console.log('🎥 Video metadata loaded:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState
            });
            clearTimeout(timeout);
            resolve(video);
          };

          video.onerror = (e) => {
            console.error('🎥 Video error:', e);
            clearTimeout(timeout);
            reject(new Error('Video loading error'));
          };

          // Force load if not already loading
          if (video.readyState === 0) {
            console.log('🎥 Forcing video load...');
            video.load();
          }
        });

        try {
          await waitForVideo;
          console.log('🎥 Video ready, attempting to play...');
          
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('🎥 Video playing successfully');
            showToast('success', 'Camera Started', 'Camera is ready!');
          }
        } catch (playError) {
          console.error('🎥 Video play error:', playError);
          // Try to continue anyway - sometimes the video plays despite errors
          showToast('warning', 'Camera Started', 'Camera may be ready (check video area)');
        }
      } else {
        // Stop the stream since we can't use it
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        throw new Error('Failed to connect stream to video element');
      }
    } catch (error) {
      console.error('🎥 Camera access error:', error);
      setIsCameraActive(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown camera error';
      
      // Make error messages more user-friendly
      let userMessage = errorMessage;
      if (errorMessage.includes('Video element not found') || errorMessage.includes('Video element still not available')) {
        userMessage = 'Camera interface not ready. Please refresh and try again.';
      } else if (errorMessage.includes('Failed to get camera stream')) {
        userMessage = 'Camera not accessible. Please check permissions.';
      } else if (errorMessage.includes('timeout')) {
        userMessage = 'Camera took too long to start. Please try again.';
      }
      
      showToast('error', 'Camera Error', userMessage);
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
      
      // Make sure video has loaded and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        showToast('error', 'Camera Error', 'Camera not ready. Please try again.');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleImageSelected(file);
            stopCamera();
            showToast('success', 'Photo Captured!', 'Your photo has been captured successfully.');
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

  const listCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Available cameras:', videoDevices);
      showToast('info', 'Camera Info', `Found ${videoDevices.length} camera(s). Check console for details.`);
    } catch (error) {
      console.error('Error listing cameras:', error);
      showToast('error', 'Camera Error', 'Could not list available cameras.');
    }
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
              muted
              controls={false}
              className="w-full rounded-lg bg-black min-h-[300px]"
              style={{ maxHeight: '70vh', objectFit: 'cover' }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log('🎥 Video metadata loaded:', {
                  videoWidth: video.videoWidth,
                  videoHeight: video.videoHeight,
                  readyState: video.readyState
                });
              }}
              onCanPlay={() => {
                console.log('🎥 Video can play');
              }}
              onPlay={() => {
                console.log('🎥 Video started playing');
              }}
              onError={(e) => {
                console.error('🎥 Video element error:', e);
              }}
              onLoadStart={() => {
                console.log('🎥 Video load started');
              }}
              onLoadedData={() => {
                console.log('🎥 Video data loaded');
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Debug Info (only in development) */}
            {import.meta.env.DEV && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded space-y-1">
                <div>Status: {isCameraActive ? 'Active' : 'Inactive'}</div>
                {videoRef.current && (
                  <>
                    <div>Video: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</div>
                    <div>Ready State: {videoRef.current.readyState}</div>
                    <div>Paused: {videoRef.current.paused ? 'Yes' : 'No'}</div>
                    <div>Ended: {videoRef.current.ended ? 'Yes' : 'No'}</div>
                    <div>Source: {videoRef.current.srcObject ? 'Set' : 'None'}</div>
                  </>
                )}
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={capturePhoto}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
                disabled={!videoRef.current || videoRef.current.videoWidth === 0}
              >
                <CameraIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => {
                  console.log('🎥 Manual retry camera...');
                  stopCamera();
                  setTimeout(startCamera, 100);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm"
              >
                Retry
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

          {/* Upload Section */}
          <div className="space-y-6">
            {/* Enhancement Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
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
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startCamera}
              className="btn btn-primary flex items-center justify-center space-x-2"
            >
              <CameraIcon className="h-5 w-5" />
              <span>Open Camera</span>
            </button>

            {/* Debug button in development */}
            {import.meta.env.DEV && (
              <button
                onClick={listCameras}
                className="btn btn-secondary flex items-center justify-center space-x-2"
              >
                <span>🔍</span>
                <span>List Cameras</span>
              </button>
            )}

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

      {/* Image Comparison Modal */}
      {showComparison && enhancementResult && (
        <ImageComparisonModal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          onConfirm={handleComparisonConfirm}
          enhancementResult={enhancementResult}
          isProcessing={pendingAnalysis}
        />
      )}
    </div>
  );
};

export default CameraPage;