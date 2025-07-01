import React, { useRef, useState } from 'react';
import { 
  CloudArrowUpIcon, 
  CogIcon, 
  SparklesIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { ImageEnhancements, EnhancedImageResult } from '../types/imageEnhancements';
import { imageEnhancementService } from '../services/imageEnhancementService';
import LoadingSpinner from './LoadingSpinner';
import ImageEnhancementSettings from './ImageEnhancementSettings';
import MultiAngleCapture from './MultiAngleCapture';

interface EnhancedImageUploadProps {
  onImageSelected: (file: File) => void;
  onEnhancedImageReady?: (result: EnhancedImageResult) => void;
  isUploading?: boolean;
  className?: string;
  enableEnhancements?: boolean;
}

const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({ 
  onImageSelected, 
  onEnhancedImageReady,
  isUploading = false,
  className = '',
  enableEnhancements = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMultiAngle, setShowMultiAngle] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  
  // Enhancement settings - Load from localStorage or use sensible defaults
  const [enhancements, setEnhancements] = useState<ImageEnhancements>(() => {
    const saved = localStorage.getItem('imageEnhancementSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('Failed to parse saved enhancement settings:', error);
      }
    }
    // Default settings
    return {
      backgroundRemoval: true,
      autoRotation: true,
      multiAngleCapture: false,
      dimensionMeasurement: true
    };
  });

  // Save settings when they change
  const handleEnhancementChange = (newEnhancements: ImageEnhancements) => {
    setEnhancements(newEnhancements);
    localStorage.setItem('imageEnhancementSettings', JSON.stringify(newEnhancements));
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid file type', 'Please select an image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File too large', 'Please select an image smaller than 10MB.');
      return;
    }

    // Check if multi-angle capture is enabled
    if (enableEnhancements && enhancements.multiAngleCapture) {
      setShowMultiAngle(true);
      return;
    }

    // Process single image
    await processImage(file);
  };

  const processImage = async (file: File) => {
    onImageSelected(file);

    if (!enableEnhancements) return;

    // Check if any enhancements are enabled
    const hasEnhancements = Object.values(enhancements).some(Boolean);
    if (!hasEnhancements) return;

    setIsProcessing(true);
    
    try {
      // Apply enhancements
      setProcessingStage('Enhancing image...');
      const result = await imageEnhancementService.enhanceImage(file, enhancements);
      
      setProcessingStage('Finalizing...');
      
      // Call the enhanced image callback if provided
      if (onEnhancedImageReady) {
        onEnhancedImageReady(result);
      }

      showToast('success', 'Image enhanced!', `Processing completed in ${(result.processingTime / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error('Image enhancement failed:', error);
      showToast('error', 'Enhancement failed', 'Using original image instead.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleMultiAngleComplete = async (images: { angle: string; image: string }[]) => {
    setShowMultiAngle(false);
    
    if (images.length === 0) return;

    // Use the first image (front view) as the main image
    const frontImage = images.find(img => img.angle === 'front') || images[0];
    
    try {
      // Convert data URL back to File
      const response = await fetch(frontImage.image);
      const blob = await response.blob();
      const file = new File([blob], 'multi-angle-front.jpg', { type: 'image/jpeg' });
      
      await processImage(file);

      if (images.length > 1) {
        showToast('success', 'Multi-angle capture complete!', `${images.length} photos captured and processed.`);
      }
    } catch (error) {
      console.error('Failed to process multi-angle images:', error);
      showToast('error', 'Failed to process images', 'Please try again.');
    }
  };

  const getEnhancementSummary = () => {
    const enabled = Object.entries(enhancements).filter(([_, value]) => value);
    if (enabled.length === 0) return 'No enhancements';
    
    const names = {
      autoRotation: 'Auto-rotate',
      backgroundRemoval: 'Remove background',
      multiAngleCapture: 'Multi-angle',
      dimensionMeasurement: 'Measure dimensions'
    };
    
    return enabled.map(([key, _]) => names[key as keyof typeof names]).join(', ');
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${isUploading || isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading || isProcessing}
          />
          
          <div className="text-center">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="lg" variant="ring" className="mb-4" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {processingStage}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Applying enhancements...
                </p>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Uploading image...
                </p>
              </div>
            ) : (
              <>
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  {enableEnhancements && (
                    <div className="flex items-center justify-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                      <SparklesIcon className="h-3 w-3" />
                      <span>{getEnhancementSummary()}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Enhancement Controls */}
        {enableEnhancements && !isUploading && !isProcessing && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <EyeIcon className="h-4 w-4" />
              <span>Smart enhancements enabled</span>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <CogIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Enhancement Settings Modal */}
      {showSettings && (
        <ImageEnhancementSettings
          initialSettings={enhancements}
          onSettingsChange={handleEnhancementChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Multi-Angle Capture Modal */}
      {showMultiAngle && (
        <MultiAngleCapture
          onCaptureComplete={handleMultiAngleComplete}
          onClose={() => setShowMultiAngle(false)}
          required={true}
        />
      )}
    </>
  );
};

export default EnhancedImageUpload;
