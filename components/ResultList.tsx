
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Copy, ExternalLink, Check } from 'lucide-react';
import { ProcessedFile, ProcessStatus } from '../types';

interface ResultListProps {
  files: ProcessedFile[];
}

const ResultList: React.FC<ResultListProps> = ({ files }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    // 2秒后重置状态
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-slate-200">处理队列 ({files.length})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden shadow-xl transition-all hover:border-slate-600"
          >
            {/* Image Preview Area */}
            <div className="h-40 w-full relative bg-slate-900/50 overflow-hidden">
              <img
                src={file.previewUrl}
                alt={file.originalFile.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              
              {/* Status Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                {file.status === ProcessStatus.PROCESSING && (
                  <div className="px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30 flex items-center gap-2 text-blue-200 text-xs font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> 处理图片...
                  </div>
                )}
                {file.status === ProcessStatus.UPLOADING && (
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-500/30 flex items-center gap-2 text-purple-200 text-xs font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> 上传中...
                  </div>
                )}
                {file.status === ProcessStatus.COMPLETED && (
                  <div className="absolute top-2 right-2 p-1 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                {file.status === ProcessStatus.ERROR && (
                   <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-full shadow-lg">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Info Area */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="truncate pr-2 w-full">
                  <h4 className="text-sm font-medium text-slate-200 truncate" title={file.originalFile.name}>
                    {file.originalFile.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded">
                        {(file.originalSize / 1024).toFixed(0)}KB
                     </span>
                     {file.processedSize && (
                       <>
                        <span className="text-xs text-slate-600">→</span>
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {(file.processedSize / 1024).toFixed(0)}KB
                        </span>
                       </>
                     )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {(file.status === ProcessStatus.PROCESSING || file.status === ProcessStatus.UPLOADING) && (
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}

              {/* Error Message */}
              {file.status === ProcessStatus.ERROR && (
                <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                  {file.errorMsg || "Unknown error"}
                </p>
              )}

              {/* Actions */}
              {file.status === ProcessStatus.COMPLETED && file.cloudinaryUrl && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(file.cloudinaryUrl!, file.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg transition-all duration-200
                      ${copiedId === file.id 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
                    `}
                  >
                    {copiedId === file.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> 已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> 复制链接
                      </>
                    )}
                  </button>
                  <a
                    href={file.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultList;
