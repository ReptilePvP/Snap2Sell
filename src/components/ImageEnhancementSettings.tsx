import React, { useState } from 'react';
import { 
  CogIcon, 
  PhotoIcon, 
  ArrowPathIcon,
  RectangleStackIcon,
  ScaleIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import { ImageEnhancements, ReferenceObject } from '../types/imageEnhancements';

interface ImageEnhancementSettingsProps {
  initialSettings?: Partial<ImageEnhancements>;
  onSettingsChange: (settings: ImageEnhancements) => void;
  onClose: () => void;
}

const REFERENCE_OBJECTS: ReferenceObject[] = [
  {
    type: 'auto',
    realWorldSize: { width: 0, height: 0, unit: 'cm' }
  },
  {
    type: 'coin',
    realWorldSize: { width: 2.426, height: 2.426, unit: 'cm' } // US Quarter
  },
  {
    type: 'card',
    realWorldSize: { width: 8.56, height: 5.398, unit: 'cm' } // Credit card
  },
  {
    type: 'hand',
    realWorldSize: { width: 19, height: 19, unit: 'cm' } // Average adult hand
  },
  {
    type: 'phone',
    realWorldSize: { width: 7.81, height: 16.08, unit: 'cm' } // iPhone size
  }
];

const ImageEnhancementSettings: React.FC<ImageEnhancementSettingsProps> = ({
  initialSettings = {},
  onSettingsChange,
  onClose
}) => {
  const [settings, setSettings] = useState<ImageEnhancements>({
    backgroundRemoval: false,
    autoRotation: true,
    multiAngleCapture: false,
    dimensionMeasurement: false,
    ...initialSettings
  });

  const [selectedReference, setSelectedReference] = useState<ReferenceObject>(REFERENCE_OBJECTS[0]);

  const handleSettingChange = (key: keyof ImageEnhancements, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleApply = () => {
    onSettingsChange(settings);
    onClose();
  };

  const getFeatureDescription = (feature: keyof ImageEnhancements) => {
    const descriptions = {
      autoRotation: {
        title: 'Auto Rotation',
        description: 'Automatically detects and corrects image orientation using EXIF data',
        benefits: ['Fixes sideways or upside-down photos', 'Consistent image orientation', 'Better user experience'],
        processingTime: 'Fast (~1 second)'
      },
      backgroundRemoval: {
        title: 'Background Removal',
        description: 'Removes cluttered backgrounds to make items stand out professionally',
        benefits: ['Professional product photos', 'Clean, consistent backgrounds', 'Higher engagement rates'],
        processingTime: 'Medium (~5-10 seconds)'
      },
      multiAngleCapture: {
        title: 'Multi-Angle Capture',
        description: 'Guides you to take photos from multiple angles for complete item documentation',
        benefits: ['Better buyer confidence', 'Reduced returns', 'Higher selling prices', 'Complete item view'],
        processingTime: 'Interactive process'
      },
      dimensionMeasurement: {
        title: 'Dimension Measurement',
        description: 'Estimates item dimensions using reference objects for accurate sizing',
        benefits: ['Automatic shipping calculations', 'Accurate descriptions', 'Better search results'],
        processingTime: 'Fast (~2 seconds)'
      }
    };

    return descriptions[feature];
  };

  const getFeatureIcon = (feature: keyof ImageEnhancements) => {
    const icons = {
      autoRotation: ArrowPathIcon,
      backgroundRemoval: PhotoIcon,
      multiAngleCapture: RectangleStackIcon,
      dimensionMeasurement: ScaleIcon
    };

    const IconComponent = icons[feature];
    return <IconComponent className="h-6 w-6" />;
  };

  const enabledCount = Object.values(settings).filter(Boolean).length;
  const estimatedProcessingTime = calculateProcessingTime(settings);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CogIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Image Enhancement Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configure automatic image processing features
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                Enhancement Summary
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                {enabledCount} feature{enabledCount !== 1 ? 's' : ''} enabled • 
                Estimated processing time: {estimatedProcessingTime}
              </p>
            </div>
            <div className="text-2xl text-blue-600">
              {enabledCount > 0 ? '✨' : '📷'}
            </div>
          </div>
        </div>

        {/* Feature Settings */}
        <div className="space-y-6 mb-6">
          {(Object.keys(settings) as Array<keyof ImageEnhancements>).map((feature) => {
            const info = getFeatureDescription(feature);
            const isEnabled = settings[feature];

            return (
              <div
                key={feature}
                className={`border rounded-lg p-4 transition-all ${
                  isEnabled 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      isEnabled 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {getFeatureIcon(feature)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {info.title}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                          {info.processingTime}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {info.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {info.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-1 text-sm">
                            <CheckIcon className="h-3 w-3 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => handleSettingChange(feature, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reference Object Selection (for dimension measurement) */}
        {settings.dimensionMeasurement && (
          <div className="border rounded-lg p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-3">
              Reference Object for Measurements
            </h4>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-4">
              Place one of these objects in your photo to help estimate dimensions accurately.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {REFERENCE_OBJECTS.map((ref) => (
                <button
                  key={ref.type}
                  onClick={() => setSelectedReference(ref)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedReference.type === ref.type
                      ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg mb-1">
                    {ref.type === 'auto' && '🔍'}
                    {ref.type === 'coin' && '🪙'}
                    {ref.type === 'card' && '💳'}
                    {ref.type === 'hand' && '✋'}
                    {ref.type === 'phone' && '📱'}
                  </div>
                  <div className="text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
                    {ref.type === 'auto' ? 'Auto Detect' : ref.type}
                  </div>
                  {ref.type !== 'auto' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {ref.realWorldSize.width}×{ref.realWorldSize.height} {ref.realWorldSize.unit}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          
          <div className="space-x-3">
            <button
              onClick={() => {
                setSettings({
                  backgroundRemoval: false,
                  autoRotation: false,
                  multiAngleCapture: false,
                  dimensionMeasurement: false
                });
              }}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Reset All
            </button>
            
            <button
              onClick={handleApply}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function calculateProcessingTime(settings: ImageEnhancements): string {
  let totalSeconds = 0;
  
  if (settings.autoRotation) totalSeconds += 1;
  if (settings.backgroundRemoval) totalSeconds += 7;
  if (settings.dimensionMeasurement) totalSeconds += 2;
  
  if (totalSeconds === 0) return 'Instant';
  if (totalSeconds <= 3) return `~${totalSeconds} seconds`;
  if (totalSeconds <= 10) return `~${totalSeconds} seconds`;
  return `~${Math.round(totalSeconds / 5) * 5} seconds`;
}

export default ImageEnhancementSettings;
