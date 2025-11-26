import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  isProcessing: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const imageFiles = Array.from(e.dataTransfer.files).filter((file: File) =>
          file.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
          onFilesDropped(imageFiles);
        }
      }
    },
    [onFilesDropped]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFiles = Array.from(e.target.files).filter((file: File) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        onFilesDropped(imageFiles);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center cursor-pointer group overflow-hidden
        ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : 'border-slate-600 hover:border-emerald-400/50 hover:bg-slate-800/50 bg-slate-800/30'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isProcessing}
      />

      <div className="z-0 flex flex-col items-center space-y-4 text-center p-4">
        <div className={`p-4 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20 transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
          <UploadCloud className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-200">
            {isDragging ? '释放以自动上传' : '拖拽图片至此'}
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            自动调整大小、转WebP并上传
          </p>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
    </div>
  );
};

export default DropZone;