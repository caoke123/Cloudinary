import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Since we can't use uuid package directly in this prompt env, I will mock it or use a simple random string generator in a real scenario. For this output, I'll use a simple helper.
import { Image as ImageIcon, Settings, Trash2, CheckCircle } from 'lucide-react';

import DropZone from './components/DropZone';
import ResultList from './components/ResultList';
import { CloudinaryConfig, ProcessedFile, ProcessStatus, CONSTANTS } from './types';
import { processImage } from './utils/imageProcessor';
import { uploadToCloudinary } from './services/cloudinaryService';

// Simple UUID generator replacement
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  // Environment-based config
  const [config] = useState<CloudinaryConfig>({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'caoke',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ecommerce-free',
    folder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'products'
  });

  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [copyAllStatus, setCopyAllStatus] = useState<'idle' | 'copied'>('idle');

  // Handle dropped files
  const handleFilesDropped = useCallback((newFiles: File[]) => {
    const newProcessedFiles: ProcessedFile[] = newFiles.map(file => ({
      id: generateId(),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      status: ProcessStatus.PENDING,
      progress: 0,
      originalSize: file.size
    }));

    setFiles(prev => [...prev, ...newProcessedFiles]);
  }, []);

  // Process Queue Effect - The "Auto Start" logic
  useEffect(() => {
    const processQueue = async () => {
      const pendingFile = files.find(f => f.status === ProcessStatus.PENDING);
      
      if (!pendingFile || isProcessingQueue) return;

      setIsProcessingQueue(true);

      try {
        // Update status to processing
        updateFileStatus(pendingFile.id, { status: ProcessStatus.PROCESSING, progress: 10 });

        // 1. Image Processing (Resize & WebP)
        const { blob, dimensions } = await processImage(pendingFile.originalFile);
        updateFileStatus(pendingFile.id, { 
          status: ProcessStatus.UPLOADING, 
          progress: 50,
          processedSize: blob.size,
          dimensions
        });

        // 2. Upload to Cloudinary
        const result = await uploadToCloudinary(blob, pendingFile.originalFile.name, config);
        
        updateFileStatus(pendingFile.id, {
          status: ProcessStatus.COMPLETED,
          progress: 100,
          cloudinaryUrl: result.secure_url
        });

      } catch (error: any) {
        console.error(error);
        updateFileStatus(pendingFile.id, {
          status: ProcessStatus.ERROR,
          progress: 0,
          errorMsg: error.message || "Processing failed"
        });
      } finally {
        setIsProcessingQueue(false);
      }
    };

    processQueue();
  }, [files, isProcessingQueue, config]);

  const updateFileStatus = (id: string, updates: Partial<ProcessedFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleClearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== ProcessStatus.COMPLETED && f.status !== ProcessStatus.ERROR));
  };

  const handleCopyAll = () => {
    const urls = files
      .filter(f => f.status === ProcessStatus.COMPLETED && f.cloudinaryUrl)
      .map(f => f.cloudinaryUrl)
      .join('\n');
    
    if (urls) {
      navigator.clipboard.writeText(urls);
      setCopyAllStatus('copied');
      setTimeout(() => setCopyAllStatus('idle'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="mb-10 text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-4 shadow-2xl shadow-indigo-900/20">
            <ImageIcon className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 tracking-tight">
            Cloudinary Pro Uploader
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            现代化图片处理工具 · 自动压缩 WebP · 智能调整尺寸
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-xs font-mono text-slate-500">
             <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
               <Settings className="w-3 h-3" /> Target: {config.folder}
             </span>
             <span className="bg-slate-800 px-2 py-1 rounded">
               Max: {CONSTANTS.MAX_SIZE}px
             </span>
             <span className="bg-slate-800 px-2 py-1 rounded">
               WebP Q: {(CONSTANTS.WEBP_QUALITY * 100).toFixed(0)}
             </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          
          {/* Drop Zone */}
          <section>
            <DropZone 
              onFilesDropped={handleFilesDropped} 
              isProcessing={false} 
            />
          </section>

          {/* Controls for Results */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-end border-b border-slate-800/50 pb-4">
               <button
                onClick={handleCopyAll}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${copyAllStatus === 'copied' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}
                `}
              >
                {copyAllStatus === 'copied' ? <CheckCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 opacity-0" />}
                {copyAllStatus === 'copied' ? '已复制所有链接' : '复制所有链接'}
              </button>
              
              <button
                onClick={handleClearCompleted}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                清空已完成
              </button>
            </div>
          )}

          {/* Results Grid */}
          <ResultList files={files} />
        </main>
      </div>
    </div>
  );
};

export default App;