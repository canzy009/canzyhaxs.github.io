
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface FileInfo {
  name: string;
  size: number;
  lastModified: number;
  type: string;
}

export function useFileStorage() {
  const [savedFiles, setSavedFiles] = useState<FileInfo[]>([]);
  const [currentFileInfo, setCurrentFileInfo] = useState<FileInfo | null>(null);
  
  // Initialize from localStorage
  useEffect(() => {
    listFiles();
  }, []);
  
  // List all saved files
  const listFiles = () => {
    try {
      const fileList: FileInfo[] = [];
      
      // Find all keys in localStorage that start with 'hexfile_'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hexfile_metadata_')) {
          const fileMetadataStr = localStorage.getItem(key);
          if (fileMetadataStr) {
            const fileName = key.replace('hexfile_metadata_', '');
            const fileMetadata = JSON.parse(fileMetadataStr) as FileInfo;
            fileList.push({ ...fileMetadata, name: fileName });
          }
        }
      }
      
      setSavedFiles(fileList);
      return fileList;
    } catch (error) {
      console.error('Error listing files:', error);
      toast.error('Error listing saved files');
      return [];
    }
  };
  
  // Save file to localStorage
  const saveFile = (fileName: string, content: ArrayBuffer) => {
    try {
      // Convert ArrayBuffer to base64 for storage
      const uint8Array = new Uint8Array(content);
      const chunks: string[] = [];
      const chunkSize = 1024 * 100; // 100KB chunks to avoid localStorage limits
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        const binary = Array.from(chunk).map(b => String.fromCharCode(b)).join('');
        const base64Chunk = btoa(binary);
        chunks.push(base64Chunk);
      }
      
      // Store the number of chunks
      localStorage.setItem(`hexfile_chunks_${fileName}`, chunks.length.toString());
      
      // Store each chunk separately
      chunks.forEach((chunk, index) => {
        localStorage.setItem(`hexfile_chunk_${fileName}_${index}`, chunk);
      });
      
      // Store file metadata
      const metadata: FileInfo = {
        name: fileName,
        size: content.byteLength,
        lastModified: Date.now(),
        type: 'application/octet-stream'
      };
      
      localStorage.setItem(`hexfile_metadata_${fileName}`, JSON.stringify(metadata));
      
      // Update the list of saved files
      listFiles();
      
      toast.success(`File saved: ${fileName}`);
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Error saving file');
      return false;
    }
  };
  
  // Load file from localStorage
  const loadFile = async (fileName: string): Promise<ArrayBuffer | null> => {
    try {
      // Get the number of chunks
      const numChunksStr = localStorage.getItem(`hexfile_chunks_${fileName}`);
      if (!numChunksStr) {
        toast.error(`File not found: ${fileName}`);
        return null;
      }
      
      const numChunks = parseInt(numChunksStr, 10);
      const chunks: string[] = [];
      
      // Load all chunks
      for (let i = 0; i < numChunks; i++) {
        const chunk = localStorage.getItem(`hexfile_chunk_${fileName}_${i}`);
        if (!chunk) {
          toast.error(`File corrupted: ${fileName}`);
          return null;
        }
        chunks.push(chunk);
      }
      
      // Combine and convert chunks back to ArrayBuffer
      const base64 = chunks.join('');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const buffer = bytes.buffer;
      
      // Get file metadata
      const metadataStr = localStorage.getItem(`hexfile_metadata_${fileName}`);
      if (metadataStr) {
        const metadata = JSON.parse(metadataStr) as FileInfo;
        setCurrentFileInfo(metadata);
      }
      
      return buffer;
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error('Error loading file');
      return null;
    }
  };
  
  // Delete file from localStorage
  const deleteFile = (fileName: string) => {
    try {
      // Get the number of chunks
      const numChunksStr = localStorage.getItem(`hexfile_chunks_${fileName}`);
      if (numChunksStr) {
        const numChunks = parseInt(numChunksStr, 10);
        
        // Remove all chunks
        for (let i = 0; i < numChunks; i++) {
          localStorage.removeItem(`hexfile_chunk_${fileName}_${i}`);
        }
      }
      
      // Remove metadata and chunks count
      localStorage.removeItem(`hexfile_metadata_${fileName}`);
      localStorage.removeItem(`hexfile_chunks_${fileName}`);
      
      // Update the list of saved files
      listFiles();
      
      toast.success(`File deleted: ${fileName}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
      return false;
    }
  };
  
  return {
    savedFiles,
    currentFileInfo,
    setCurrentFileInfo,
    saveFile,
    loadFile,
    deleteFile,
    listFiles
  };
}
