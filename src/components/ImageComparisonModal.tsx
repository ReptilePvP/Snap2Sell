import React, { useState } from 'react';
import { XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { EnhancedImageResult } from '../types/imageEnhancements';
import LoadingSpinner from './LoadingSpinner';

interface ImageComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (useEnhanced: boolean) => void;
  enhancementResult: EnhancedImageResult;
  isProcessing?: boolean;
}

const ImageComparisonModal: React.FC<ImageComparisonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  enhancementResult,
  isProcessing = false
}) => {
  const [selectedImage, setSelectedImage] = useState<'original' | 'enhanced'>('enhanced');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedImage === 'enhanced');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Image Enhancement Complete
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Enhancement Summary */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Enhancements Applied
            </h3>
            <div className="flex flex-wrap gap-2">
              {enhancementResult.appliedEnhancements?.map((enhancement, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {enhancement}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Processing time: {(enhancementResult.processingTime / 1000).toFixed(1)}s
            </p>
          </div>

          {/* Image Selection Toggle */}
          <div className="mb-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSelectedImage('original')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedImage === 'original'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Original Image
              </button>
              <button
                onClick={() => setSelectedImage('enhanced')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedImage === 'enhanced'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Enhanced Image
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="relative">
              <img
                src={selectedImage === 'original' ? enhancementResult.originalImage : enhancementResult.processedImage}
                alt={selectedImage === 'original' ? 'Original' : 'Enhanced'}
                className="w-full max-h-96 object-contain rounded-lg"
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                {selectedImage === 'original' ? 'Original' : 'Enhanced'}
              </div>
            </div>
          </div>

          {/* Side-by-side comparison for larger screens */}
          <div className="hidden lg:block mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Side-by-side Comparison
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Original</h4>
                <img
                  src={enhancementResult.originalImage}
                  alt="Original"
                  className="w-full max-h-48 object-contain rounded-lg"
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Enhanced</h4>
                <img
                  src={enhancementResult.processedImage}
                  alt="Enhanced"
                  className="w-full max-h-48 object-contain rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Dimension Information */}
          {enhancementResult.dimensions && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                Estimated Dimensions
              </h3>
              <div className="text-sm text-green-800 dark:text-green-200">
                <p>Width: {enhancementResult.dimensions.width} {enhancementResult.dimensions.unit}</p>
                <p>Height: {enhancementResult.dimensions.height} {enhancementResult.dimensions.unit}</p>
                <p>Depth: {enhancementResult.dimensions.depth} {enhancementResult.dimensions.unit}</p>
                <p className="text-xs mt-1">
                  Confidence: {(enhancementResult.dimensions.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Choose which image to use for analysis
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Use Original
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Use {selectedImage === 'enhanced' ? 'Enhanced' : 'Original'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonModal;
