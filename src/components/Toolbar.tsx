
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Upload, 
  Save, 
  FileText, 
  Menu, 
  Settings, 
  Info, 
  Layers,
  Download,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ToolbarProps {
  onUpload: () => void;
  onSave: () => void;
  fileName: string | undefined;
  savedFiles: { name: string; size: number; lastModified: number }[];
  onLoadSaved: (fileName: string) => Promise<ArrayBuffer | null>;
  setCurrentFile: (file: File | null) => void;
  setFileContent: (content: ArrayBuffer | null) => void;
  setStatusMessage: (message: string) => void;
  addToCommandHistory: (command: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUpload,
  onSave,
  fileName,
  savedFiles,
  onLoadSaved,
  setCurrentFile,
  setFileContent,
  setStatusMessage,
  addToCommandHistory
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dateTimeRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useState(() => {
    const interval = setInterval(() => {
      if (dateTimeRef.current) {
        const now = new Date();
        dateTimeRef.current.textContent = now.toLocaleTimeString();
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleLoadSaved = async (fileName: string) => {
    const content = await onLoadSaved(fileName);
    if (content) {
      // Create a File object from the ArrayBuffer
      const file = new File([content], fileName, { 
        type: 'application/octet-stream',
        lastModified: Date.now()
      });
      setCurrentFile(file);
      setFileContent(content);
      setStatusMessage(`Loaded saved file: ${fileName} (${content.byteLength} bytes)`);
      addToCommandHistory(`load ${fileName}`);
      toast.success(`Loaded ${fileName}`);
    } else {
      toast.error(`Failed to load ${fileName}`);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-2 px-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-teal-400 to-blue-500 p-1 rounded">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-2 text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Canzy-Xtr
            </h1>
          </div>
          
          <div className="hidden md:flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUpload}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <Upload className="h-4 w-4 mr-1" />
              Open
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSave}
              disabled={!fileName}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 disabled:text-gray-500"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Recent
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-gray-200">
                <DropdownMenuLabel>Saved Files</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedFiles.length > 0 ? (
                  savedFiles.map((file) => (
                    <DropdownMenuItem 
                      key={file.name}
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                      onClick={() => handleLoadSaved(file.name)}
                    >
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <span className="text-xs text-gray-400">{formatBytes(file.size)}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved files</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div 
            ref={dateTimeRef} 
            className="hidden md:block text-gray-300 text-sm mr-4 animate-pulse-slow"
          >
            {new Date().toLocaleTimeString()}
          </div>
          
          {fileName && (
            <div className="mr-3 px-2 py-1 bg-gray-700/50 rounded text-xs">
              <span className="text-teal-400 mr-1">File:</span>
              <span className="text-gray-300">{fileName}</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-gray-700 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 md:hidden rounded-full border-gray-700 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="mt-2 py-2 border-t border-gray-700 md:hidden">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUpload}
              className="flex-1 text-gray-300 border-gray-700 hover:bg-gray-700"
            >
              <Upload className="h-4 w-4 mr-1" />
              Open
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSave}
              disabled={!fileName}
              className="flex-1 text-gray-300 border-gray-700 hover:bg-gray-700 disabled:text-gray-500"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-gray-300 border-gray-700 hover:bg-gray-700"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Recent
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-gray-200">
                <DropdownMenuLabel>Saved Files</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedFiles.length > 0 ? (
                  savedFiles.map((file) => (
                    <DropdownMenuItem 
                      key={file.name}
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                      onClick={() => handleLoadSaved(file.name)}
                    >
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <span className="text-xs text-gray-400">{formatBytes(file.size)}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved files</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
