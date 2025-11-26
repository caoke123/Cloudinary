import { CONSTANTS } from '../types';

/**
 * Resizes an image and converts it to WebP, mirroring the Python logic:
 * - If square (within tolerance), resize to 800x800.
 * - If not square, resize max dimension to 800.
 * - Convert to WebP with 0.8 quality.
 */
export const processImage = (file: File): Promise<{ blob: Blob; dimensions: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const width = img.width;
      const height = img.height;
      let newWidth = width;
      let newHeight = height;

      // Logic from Python: abs(width - height) < 10
      const isSquare = Math.abs(width - height) < CONSTANTS.SQUARE_TOLERANCE;

      if (isSquare) {
        if (width > CONSTANTS.SQUARE_SIZE || height > CONSTANTS.SQUARE_SIZE) {
          newWidth = CONSTANTS.SQUARE_SIZE;
          newHeight = CONSTANTS.SQUARE_SIZE;
        }
      } else {
        if (Math.max(width, height) > CONSTANTS.MAX_SIZE) {
          if (width > height) {
            newWidth = CONSTANTS.MAX_SIZE;
            newHeight = Math.round(height * (CONSTANTS.MAX_SIZE / width));
          } else {
            newHeight = CONSTANTS.MAX_SIZE;
            newWidth = Math.round(width * (CONSTANTS.MAX_SIZE / height));
          }
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // High quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image (handle transparency for WebP)
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ 
              blob, 
              dimensions: `${newWidth}x${newHeight}` 
            });
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/webp',
        CONSTANTS.WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};