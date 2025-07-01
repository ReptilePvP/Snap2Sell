import React, { useState } from 'react';
import { 
  SparklesIcon, 
  PhotoIcon, 
  ArrowPathIcon,
  RectangleStackIcon,
  ScaleIcon 
} from '@heroicons/react/24/outline';
import EnhancedImageUpload from '../components/EnhancedImageUpload';
import { EnhancedImageResult } from '../types/imageEnhancements';

const ImageEnhancementDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancedImageResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setShowComparison(false);
  };

  const handleEnhancementComplete = (result: EnhancedImageResult) => {
    setEnhancementResult(result);
    setShowComparison(true);
  };

  const features = [
    {
      icon: ArrowPathIcon,
      title: 'Auto Rotation',
      description: 'Automatically detects and corrects image orientation using EXIF data',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      icon: PhotoIcon,
      title: 'Background Removal',
      description: 'Removes cluttered backgrounds to create professional product photos',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      icon: RectangleStackIcon,
      title: 'Multi-Angle Capture',
      description: 'Guides you to take photos from multiple angles for complete documentation',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      icon: ScaleIcon,
      title: 'Dimension Measurement',
      description: 'Estimates item dimensions using reference objects for accurate sizing',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <SparklesIcon className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Image Enhancement Features
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Advanced image processing tools to create professional product photos automatically
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4`}>
                <IconComponent className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Demo Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Try the Image Enhancement Tools
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload Your Image
            </h3>
            <EnhancedImageUpload
              onImageSelected={handleImageSelected}
              onEnhancedImageReady={handleEnhancementComplete}
              enableEnhancements={true}
              className="w-full"
            />
            
            {selectedFile && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Selected File
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Name: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Type: {selectedFile.type}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enhancement Results
            </h3>
            
            {showComparison && enhancementResult ? (
              <div className="space-y-6">
                {/* Before/After Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original
                    </h4>
                    <img
                      src={enhancementResult.originalImage}
                      alt="Original"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enhanced
                    </h4>
                    <img
                      src={enhancementResult.processedImage}
                      alt="Enhanced"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                </div>

                {/* Enhancement Details */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                    Applied Enhancements
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(enhancementResult.enhancements).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-blue-800 dark:text-blue-200 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          enabled 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {enabled ? 'Applied' : 'Skipped'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800 dark:text-blue-200">Processing Time:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-300">
                        {(enhancementResult.processingTime / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Dimensions (if measured) */}
                  {enhancementResult.dimensions && (
                    <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Measured Dimensions
                      </h5>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 dark:text-blue-400">Width:</span>
                          <span className="ml-1 font-medium text-blue-900 dark:text-blue-300">
                            {enhancementResult.dimensions.width} {enhancementResult.dimensions.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700 dark:text-blue-400">Height:</span>
                          <span className="ml-1 font-medium text-blue-900 dark:text-blue-300">
                            {enhancementResult.dimensions.height} {enhancementResult.dimensions.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700 dark:text-blue-400">Depth:</span>
                          <span className="ml-1 font-medium text-blue-900 dark:text-blue-300">
                            {enhancementResult.dimensions.depth} {enhancementResult.dimensions.unit}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        Confidence: {Math.round(enhancementResult.dimensions.confidence * 100)}%
                        {enhancementResult.dimensions.referenceObject && (
                          <span className="ml-2">
                            (Using {enhancementResult.dimensions.referenceObject})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload an image to see enhancement results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Technical Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Processing Pipeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Image Upload</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Validate file type, size, and prepare for processing
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">EXIF Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Extract orientation data and apply corrections
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Enhancement Processing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Apply selected enhancements using computer vision
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Result Generation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate optimized image and metadata
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Auto Rotation</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">~1s</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Background Removal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">~5-10s</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dimension Measurement</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">~2s</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Multi-Angle Capture</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Interactive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEnhancementDemo;
