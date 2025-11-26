
export enum ProcessStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ProcessedFile {
  id: string;
  // 修改这里：允许 originalFile 是 File 对象或者是仅包含元数据的对象（用于从 localStorage 恢复）
  originalFile: File | { name: string; size: number; type?: string };
  previewUrl: string;
  status: ProcessStatus;
  progress: number;
  cloudinaryUrl?: string;
  errorMsg?: string;
  originalSize: number;
  processedSize?: number;
  dimensions?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder: string;
}

export const CONSTANTS = {
  MAX_SIZE: 800,
  SQUARE_SIZE: 800,
  WEBP_QUALITY: 0.8,
  SQUARE_TOLERANCE: 10,
};
