import React, { useState, useRef } from 'react';
import { 
  CameraIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';
import { CaptureGuide } from '../types/imageEnhancements';
import { useToast } from '../hooks/useToast';

interface MultiAngleCaptureProps {
  onCaptureComplete: (images: { angle: string; image: string }[]) => void;
  onClose: () => void;
  required?: boolean;
}

const CAPTURE_GUIDES: CaptureGuide[] = [
  {
    angle: 'front',
    completed: false,
    instruction: 'Take a clear front view of the item',
    required: true
  },
  {
    angle: 'back',
    completed: false,
    instruction: 'Show the back or rear view',
    required: true
  },
  {
    angle: 'side',
    completed: false,
    instruction: 'Capture the side profile',
    required: false
  },
  {
    angle: 'detail',
    completed: false,
    instruction: 'Close-up of important details or features',
    required: false
  },
  {
    angle: 'tag',
    completed: false,
    instruction: 'Photo of brand tag, label, or signature',
    required: false
  }
];

const MultiAngleCapture: React.FC<MultiAngleCaptureProps> = ({
  onCaptureComplete,
  onClose,
  required = false
}) => {
  const [captureGuides, setCaptureGuides] = useState<CaptureGuide[]>(CAPTURE_GUIDES);
  const [currentStep, setCurrentStep] = useState(0);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (file: File, stepIndex: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      setCaptureGuides(prev => prev.map((guide, index) => 
        index === stepIndex 
          ? { ...guide, completed: true, image: imageUrl }
          : guide
      ));

      // Move to next uncompleted step
      const nextStep = captureGuides.findIndex((guide, index) => 
        index > stepIndex && !guide.completed
      );
      
      if (nextStep !== -1) {
        setCurrentStep(nextStep);
      } else {
        // All required steps completed
        checkCompletion();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (stepIndex: number) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showToast('error', 'File too large', 'Please select an image smaller than 10MB.');
          return;
        }
        handleImageCapture(file, stepIndex);
      }
    };
    fileInput.click();
  };

  const handleRetake = (stepIndex: number) => {
    setCaptureGuides(prev => prev.map((guide, index) => 
      index === stepIndex 
        ? { ...guide, completed: false, image: undefined }
        : guide
    ));
    setCurrentStep(stepIndex);
  };

  const checkCompletion = () => {
    const requiredCompleted = captureGuides.filter(guide => guide.required && guide.completed);
    const totalRequired = captureGuides.filter(guide => guide.required);
    
    if (requiredCompleted.length >= totalRequired.length) {
      const completedImages = captureGuides
        .filter(guide => guide.completed && guide.image)
        .map(guide => ({
          angle: guide.angle,
          image: guide.image!
        }));
      
      onCaptureComplete(completedImages);
      showToast('success', 'Multi-angle capture complete!', `${completedImages.length} photos captured.`);
    }
  };

  const handleFinish = () => {
    const completedImages = captureGuides
      .filter(guide => guide.completed && guide.image)
      .map(guide => ({
        angle: guide.angle,
        image: guide.image!
      }));

    if (required) {
      const requiredCompleted = captureGuides.filter(guide => guide.required && guide.completed);
      const totalRequired = captureGuides.filter(guide => guide.required);
      
      if (requiredCompleted.length < totalRequired.length) {
        showToast('warning', 'Missing required photos', 'Please complete all required photo angles.');
        return;
      }
    }

    onCaptureComplete(completedImages);
  };

  const getStepIcon = (guide: CaptureGuide, index: number) => {
    if (guide.completed) {
      return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
    } else if (index === currentStep) {
      return <CameraIcon className="h-6 w-6 text-blue-600 animate-pulse" />;
    } else {
      return <PhotoIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getAngleInstruction = (angle: string) => {
    const instructions = {
      front: {
        title: 'Front View',
        description: 'Position the item facing the camera directly. Ensure good lighting and the entire item is visible.',
        tips: ['Center the item in frame', 'Use natural light if possible', 'Keep the camera steady']
      },
      back: {
        title: 'Back View', 
        description: 'Rotate the item to show the back or rear side. This helps buyers see the complete item.',
        tips: ['Show any back details', 'Include care labels or tags', 'Maintain good lighting']
      },
      side: {
        title: 'Side Profile',
        description: 'Capture the item from the side to show its depth and profile.',
        tips: ['Show the thickness/depth', 'Choose the most informative side', 'Keep the background simple']
      },
      detail: {
        title: 'Detail Shot',
        description: 'Take a close-up photo of important features, textures, or unique details.',
        tips: ['Focus on key features', 'Show texture or material', 'Highlight unique aspects']
      },
      tag: {
        title: 'Brand/Label',
        description: 'Photograph any brand tags, labels, signatures, or authenticity markers.',
        tips: ['Ensure text is readable', 'Include size tags', 'Show authenticity markers']
      }
    };

    return instructions[angle as keyof typeof instructions] || instructions.front;
  };

  const currentGuide = captureGuides[currentStep];
  const instruction = currentGuide ? getAngleInstruction(currentGuide.angle) : null;
  const completedCount = captureGuides.filter(guide => guide.completed).length;
  const requiredCount = captureGuides.filter(guide => guide.required).length;
  const completedRequired = captureGuides.filter(guide => guide.required && guide.completed).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Multi-Angle Photo Capture
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress: {completedCount}/{captureGuides.length} photos</span>
            <span>Required: {completedRequired}/{requiredCount}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / captureGuides.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Instruction */}
        {instruction && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              {instruction.title} {currentGuide?.required && <span className="text-red-500">*</span>}
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-3">
              {instruction.description}
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
              {instruction.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Capture Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {captureGuides.map((guide, index) => (
            <div
              key={guide.angle}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : guide.completed
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              onClick={() => !guide.completed && setCurrentStep(index)}
            >
              <div className="flex items-start space-x-3">
                {getStepIcon(guide, index)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {guide.angle} View
                    </h4>
                    {guide.required && <span className="text-red-500 text-xs">Required</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {guide.instruction}
                  </p>
                  
                  {guide.completed && guide.image && (
                    <div className="mt-3">
                      <img
                        src={guide.image}
                        alt={`${guide.angle} view`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetake(index);
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <ArrowPathIcon className="h-3 w-3" />
                        <span>Retake</span>
                      </button>
                    </div>
                  )}

                  {!guide.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileInput(index);
                      }}
                      className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Take Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          
          <div className="space-x-3">
            {completedCount > 0 && (
              <button
                onClick={handleFinish}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                disabled={required && completedRequired < requiredCount}
              >
                Finish ({completedCount} photos)
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MultiAngleCapture;
