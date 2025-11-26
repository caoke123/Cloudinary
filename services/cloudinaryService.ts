import { CloudinaryConfig } from '../types';

export const uploadToCloudinary = async (
  file: Blob, 
  fileName: string, 
  config: CloudinaryConfig
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', config.folder);
  // Using the original filename (without extension) allows Cloudinary to manage naming if configured
  formData.append('public_id', fileName.replace(/\.[^/.]+$/, "")); 

  const cloudName = config.cloudName;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};