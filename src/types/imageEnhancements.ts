export interface ImageEnhancements {
  backgroundRemoval: boolean;
  autoRotation: boolean;
  multiAngleCapture: boolean;
  dimensionMeasurement: boolean;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
  unit: 'cm' | 'inch';
  confidence: number;
  referenceObject?: string;
}

export interface CaptureGuide {
  angle: 'front' | 'back' | 'side' | 'top' | 'detail' | 'tag';
  completed: boolean;
  image?: string;
  instruction: string;
  required: boolean;
}

export interface ReferenceObject {
  type: 'coin' | 'card' | 'hand' | 'phone' | 'auto';
  realWorldSize: {
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
}

export interface EnhancedImageResult {
  originalImage: string;
  processedImage: string;
  enhancements: ImageEnhancements;
  appliedEnhancements?: string[];
  dimensions?: Dimensions;
  captureGuides?: CaptureGuide[];
  processingTime: number;
}
