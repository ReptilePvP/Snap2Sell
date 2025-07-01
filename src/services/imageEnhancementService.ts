import { ImageEnhancements, Dimensions, ReferenceObject, EnhancedImageResult } from '../types/imageEnhancements';

// EXIF orientation values
const ORIENTATION_TRANSFORMS: Record<number, { rotate: number; scaleX: number; scaleY: number }> = {
  1: { rotate: 0, scaleX: 1, scaleY: 1 },
  2: { rotate: 0, scaleX: -1, scaleY: 1 },
  3: { rotate: 180, scaleX: 1, scaleY: 1 },
  4: { rotate: 180, scaleX: -1, scaleY: 1 },
  5: { rotate: 270, scaleX: -1, scaleY: 1 },
  6: { rotate: 90, scaleX: 1, scaleY: 1 },
  7: { rotate: 90, scaleX: -1, scaleY: 1 },
  8: { rotate: 270, scaleX: 1, scaleY: 1 }
};

export class ImageEnhancementService {
  private static instance: ImageEnhancementService;

  public static getInstance(): ImageEnhancementService {
    if (!ImageEnhancementService.instance) {
      ImageEnhancementService.instance = new ImageEnhancementService();
    }
    return ImageEnhancementService.instance;
  }

  /**
   * 1. AUTO ROTATION - Detect and correct image orientation using EXIF data
   */
  async autoRotateImage(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          // Try to read EXIF data
          this.getExifOrientation(imageFile).then(orientation => {
            const transform = ORIENTATION_TRANSFORMS[orientation] || ORIENTATION_TRANSFORMS[1];
            
            // Calculate canvas dimensions based on rotation
            const { width, height } = this.getRotatedDimensions(img.width, img.height, transform.rotate);
            canvas.width = width;
            canvas.height = height;

            // Apply transformation
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate((transform.rotate * Math.PI) / 180);
            ctx.scale(transform.scaleX, transform.scaleY);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            ctx.restore();

            resolve(canvas.toDataURL('image/jpeg', 0.9));
          });
        } catch (error) {
          // Fallback: return original image if EXIF reading fails
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private async getExifOrientation(file: File): Promise<number> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const dataView = new DataView(arrayBuffer);
        
        // Check for JPEG signature
        if (dataView.getUint16(0) !== 0xFFD8) {
          resolve(1); // No EXIF data, assume normal orientation
          return;
        }

        let offset = 2;
        while (offset < dataView.byteLength) {
          const marker = dataView.getUint16(offset);
          if (marker === 0xFFE1) { // EXIF marker
            const exifOffset = offset + 4;
            const orientation = this.getOrientationFromExif(dataView, exifOffset);
            resolve(orientation);
            return;
          }
          offset += 2 + dataView.getUint16(offset + 2);
        }
        resolve(1); // Default orientation
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private getOrientationFromExif(dataView: DataView, offset: number): number {
    try {
      // Simple EXIF orientation extraction
      // This is a simplified version - in production, you might want to use a library like exif-js
      const length = dataView.getUint16(offset);
      for (let i = offset + 2; i < offset + length; i += 12) {
        if (dataView.getUint16(i) === 0x0112) { // Orientation tag
          return dataView.getUint16(i + 8);
        }
      }
    } catch (error) {
      console.warn('Failed to read EXIF orientation:', error);
    }
    return 1; // Default orientation
  }

  private getRotatedDimensions(width: number, height: number, rotation: number) {
    if (rotation === 90 || rotation === 270) {
      return { width: height, height: width };
    }
    return { width, height };
  }

  /**
   * 2. BACKGROUND REMOVAL - Remove background using Remove.bg API or Canvas processing
   */
  async removeBackground(imageFile: File, useAI: boolean = true): Promise<string> {
    if (useAI) {
      return this.removeBackgroundWithAI(imageFile);
    } else {
      return this.removeBackgroundLocal(imageFile);
    }
  }

  private async removeBackgroundWithAI(imageFile: File): Promise<string> {
    try {
      console.log('🖼️ Starting AI background removal...');
      
      // First upload the image to get a URL
      const { uploadImageDirectly } = await import('./apiService');
      console.log('🖼️ Uploading image for background removal...');
      const imageUrl = await uploadImageDirectly(imageFile);
      console.log('🖼️ Image uploaded:', imageUrl);

      // Call our Supabase Edge Function for background removal
      const { supabase } = await import('./supabaseClient');
      console.log('🖼️ Calling remove-background edge function...');
      
      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { imageUrl }
      });

      console.log('🖼️ Edge function response:', { data, error });

      if (error) {
        console.error('🖼️ Edge function error:', error);
        throw new Error(error.message || 'Background removal failed');
      }
      
      // Check if the response indicates success
      if (data?.success === true && data?.processedImageUrl) {
        console.log('🖼️ Background removal successful:', data.processedImageUrl);
        return data.processedImageUrl;
      } else if (data?.success === false && data?.originalImageUrl) {
        console.warn('🖼️ Background removal failed, API returned original image');
        // If the API failed but returned the original, fall back to local processing
        throw new Error(data?.error || 'Background removal API failed');
      } else {
        console.warn('🖼️ Unexpected response format:', data);
        throw new Error('Invalid response from background removal service');
      }
    } catch (error) {
      console.error('🖼️ AI background removal failed, falling back to local processing:', error);
      return this.removeBackgroundLocal(imageFile);
    }
  }

  private async removeBackgroundLocal(imageFile: File): Promise<string> {
    // Simple edge detection and background removal
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple background removal based on edge detection
        // This is a basic implementation - for better results, use AI services
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          
          // Check if pixel is likely background (corners and edges)
          if (this.isLikelyBackground(x, y, canvas.width, canvas.height, data, i)) {
            data[i + 3] = 0; // Make transparent
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  private isLikelyBackground(x: number, y: number, width: number, height: number, data: Uint8ClampedArray, index: number): boolean {
    // Simple heuristic: pixels near edges are more likely to be background
    const edgeThreshold = Math.min(width, height) * 0.1;
    const nearEdge = x < edgeThreshold || x > width - edgeThreshold || 
                     y < edgeThreshold || y > height - edgeThreshold;
    
    if (!nearEdge) return false;

    // Check if pixel is similar to corner pixels (likely background)
    const cornerPixels = [
      { x: 0, y: 0 },
      { x: width - 1, y: 0 },
      { x: 0, y: height - 1 },
      { x: width - 1, y: height - 1 }
    ];

    const currentR = data[index];
    const currentG = data[index + 1];
    const currentB = data[index + 2];

    return cornerPixels.some(corner => {
      const cornerIndex = (corner.y * width + corner.x) * 4;
      const cornerR = data[cornerIndex];
      const cornerG = data[cornerIndex + 1];
      const cornerB = data[cornerIndex + 2];

      const colorDiff = Math.abs(currentR - cornerR) + 
                       Math.abs(currentG - cornerG) + 
                       Math.abs(currentB - cornerB);
      
      return colorDiff < 50; // Threshold for similar colors
    });
  }

  /**
   * 3. DIMENSION MEASUREMENT - Estimate dimensions using reference objects
   */
  async measureDimensions(imageFile: File, referenceObject?: ReferenceObject): Promise<Dimensions> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Detect reference object if not provided
        const detectedReference = referenceObject || this.detectReferenceObject(imageData);
        
        // Estimate dimensions based on reference
        const dimensions = this.calculateDimensions(imageData, detectedReference);
        
        resolve(dimensions);
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  private detectReferenceObject(_imageData: ImageData): ReferenceObject {
    // Simple reference object detection
    // In a real implementation, you'd use computer vision libraries
    
    // Default to credit card dimensions if no specific object detected
    return {
      type: 'card',
      realWorldSize: {
        width: 8.56, // cm
        height: 5.398, // cm
        unit: 'cm'
      }
    };
  }

  private calculateDimensions(imageData: ImageData, reference: ReferenceObject): Dimensions {
    // Simplified dimension calculation
    // In reality, this would involve complex computer vision algorithms
    
    const { width, height } = imageData;
    
    // Estimate scale based on reference object (simplified)
    const estimatedScale = this.estimateScale(imageData, reference);
    
    const estimatedWidth = (width * estimatedScale.pixelsPerCm);
    const estimatedHeight = (height * estimatedScale.pixelsPerCm);
    
    return {
      width: Math.round(estimatedWidth * 10) / 10,
      height: Math.round(estimatedHeight * 10) / 10,
      depth: Math.round(Math.min(estimatedWidth, estimatedHeight) * 0.3 * 10) / 10, // Estimated depth
      unit: 'cm',
      confidence: estimatedScale.confidence,
      referenceObject: reference.type
    };
  }

  private estimateScale(imageData: ImageData, reference: ReferenceObject): { pixelsPerCm: number; confidence: number } {
    // This is a simplified implementation
    // Real implementation would detect the reference object in the image
    
    const assumedReferencePixelSize = Math.min(imageData.width, imageData.height) * 0.15; // Assume reference is 15% of image
    const actualReferenceSize = reference.realWorldSize.width; // cm
    
    return {
      pixelsPerCm: assumedReferencePixelSize / actualReferenceSize,
      confidence: 0.6 // Medium confidence for this simple estimation
    };
  }

  /**
   * 4. COMPREHENSIVE IMAGE ENHANCEMENT
   */
  async enhanceImage(
    imageFile: File, 
    enhancements: Partial<ImageEnhancements>,
    referenceObject?: ReferenceObject
  ): Promise<EnhancedImageResult> {
    console.log('🎨 Starting image enhancement with settings:', enhancements);
    const startTime = Date.now();
    let processedImage = URL.createObjectURL(imageFile);
    const originalImage = processedImage;
    const appliedEnhancements: string[] = [];

    try {
      // Apply auto rotation if enabled
      if (enhancements.autoRotation) {
        console.log('🎨 Applying auto-rotation...');
        processedImage = await this.autoRotateImage(imageFile);
        appliedEnhancements.push('Auto-rotation');
        // Convert back to File for subsequent processing
        imageFile = await this.dataURLToFile(processedImage, imageFile.name);
      }

      // Apply background removal if enabled
      if (enhancements.backgroundRemoval) {
        console.log('🎨 Applying background removal...');
        processedImage = await this.removeBackground(imageFile);
        appliedEnhancements.push('Background removal');
        imageFile = await this.dataURLToFile(processedImage, imageFile.name);
      }

      // Measure dimensions if enabled
      let dimensions: Dimensions | undefined;
      if (enhancements.dimensionMeasurement) {
        console.log('🎨 Measuring dimensions...');
        dimensions = await this.measureDimensions(imageFile, referenceObject);
        appliedEnhancements.push('Dimension measurement');
      }

      const processingTime = Date.now() - startTime;
      console.log('🎨 Enhancement complete! Applied:', appliedEnhancements, 'Time:', processingTime + 'ms');

      return {
        originalImage,
        processedImage,
        enhancements: enhancements as ImageEnhancements,
        appliedEnhancements,
        dimensions,
        processingTime,
      };
    } catch (error) {
      console.error('🎨 Enhancement failed:', error);
      throw error;
    }
  }

  private async dataURLToFile(dataURL: string, filename: string): Promise<File> {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }
}

export const imageEnhancementService = ImageEnhancementService.getInstance();
