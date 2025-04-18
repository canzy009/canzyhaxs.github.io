
import React from 'react';

interface StatusBarProps {
  fileInfo: {
    name: string;
    size: number;
    lastModified: number;
    type: string;
  } | null;
  statusMessage: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ fileInfo, statusMessage }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 py-1 px-4 text-xs text-gray-400 flex justify-between">
      <div className="flex items-center">
        <span className="font-mono animate-pulse-slow">
          {statusMessage || (fileInfo 
            ? `${fileInfo.name} | ${formatBytes(fileInfo.size)}` 
            : 'Ready')}
        </span>
      </div>
      
      <div className="flex space-x-4">
        <div>
          {fileInfo && (
            <span className="font-mono">
              Size: {formatBytes(fileInfo.size)}
            </span>
          )}
        </div>
        
        <div>
          <span>Canzy-Xtr v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
