
import { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import HexViewer from "@/components/HexViewer";
import Toolbar from "@/components/Toolbar";
import StatusBar from "@/components/StatusBar";
import CommandLine from "@/components/CommandLine";
import ControlButtons from "@/components/ControlButtons";
import { useFileStorage } from "@/hooks/useFileStorage";

const Index = () => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeAddress, setActiveAddress] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    saveFile, 
    loadFile, 
    listFiles, 
    savedFiles,
    currentFileInfo,
    setCurrentFileInfo
  } = useFileStorage();
  
  useEffect(() => {
    listFiles();
    setStatusMessage("Canzy-Xtr Hex Editor ready. Type 'help' for commands.");
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setCurrentFile(file);
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 99) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 100);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as ArrayBuffer;
      setFileContent(content);
      setCurrentFileInfo({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type
      });
      setStatusMessage(`File loaded: ${file.name} (Size: ${file.size} bytes)`);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        clearInterval(progressInterval);
        addToCommandHistory(`load ${file.name}`);
      }, 500);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleSaveFile = () => {
    if (fileContent && currentFile) {
      saveFile(currentFile.name, fileContent);
      setStatusMessage(`File saved: ${currentFile.name}`);
      addToCommandHistory(`save ${currentFile.name}`);
    }
  };

  const executeCommand = (cmd: string) => {
    setCommand("");
    addToCommandHistory(cmd);

    const cmdLower = cmd.toLowerCase().trim();
    
    if (cmdLower === 'help') {
      setStatusMessage("Commands: load <file>, save, edit <address>, exit, help, ?");
    } else if (cmdLower === '?' || cmdLower === 'check') {
      setStatusMessage(`Current file: ${currentFile?.name || "None"} | Size: ${currentFile?.size || 0} bytes | Editor mode: ${editMode ? "Edit" : "View"}`);
    } else if (cmdLower === 'exit' || cmdLower === 'quit') {
      setStatusMessage("Thank you for using Canzy-Xtr Hex Editor.");
      setTimeout(() => {
        setStatusMessage("Canzy-Xtr Hex Editor ready. Type 'help' for commands.");
      }, 2000);
    } else if (cmdLower.startsWith('load ')) {
      triggerFileUpload();
    } else if (cmdLower === 'save') {
      handleSaveFile();
    } else if (cmdLower.startsWith('edit ')) {
      const addressStr = cmd.substring(5);
      try {
        const address = parseInt(addressStr, 16);
        setActiveAddress(address);
        setEditMode(true);
        setStatusMessage(`Editing at address: 0x${address.toString(16).padStart(8, '0')}`);
      } catch (e) {
        setStatusMessage("Invalid address format. Use hexadecimal (e.g., 0x100 or 100)");
      }
    } else {
      setStatusMessage(`Unknown command: ${cmd}. Type 'help' for available commands.`);
    }
  };

  const addToCommandHistory = (cmd: string) => {
    setCommandHistory(prev => [...prev, cmd]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload} 
      />
      
      <Toolbar 
        onUpload={triggerFileUpload} 
        onSave={handleSaveFile} 
        fileName={currentFile?.name} 
        savedFiles={savedFiles}
        onLoadSaved={loadFile}
        setCurrentFile={setCurrentFile}
        setFileContent={setFileContent}
        setStatusMessage={setStatusMessage}
        addToCommandHistory={addToCommandHistory}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="text-xl font-bold animate-pulse">Loading file...</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">{loadingProgress}% complete</div>
          </div>
        ) : (
          <>
            {fileContent ? (
              <>
                <div className="mb-4 bg-gray-800 p-2 rounded text-sm animate-fade-in">
                  <div className="font-mono text-green-400">
                    {statusMessage || `Viewing file: ${currentFile?.name} (${fileContent.byteLength} bytes)`}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Address: 0x{activeAddress.toString(16).padStart(8, '0')}</span>
                    <span>Mode: {editMode ? "EDIT" : "VIEW"}</span>
                  </div>
                </div>
                
                <div className="flex-1 mb-4 overflow-auto rounded bg-gray-800 border border-gray-700">
                  <HexViewer 
                    data={fileContent} 
                    activeAddress={activeAddress}
                    editMode={editMode}
                    onAddressChange={setActiveAddress}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 animate-scale-in">
                  <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                    Canzy-Xtr Hex Editor
                  </h2>
                  <p className="text-gray-400">Upload a file to begin editing its hexadecimal values</p>
                  <button 
                    onClick={triggerFileUpload}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded hover:opacity-90 transition-all transform hover:scale-105"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <CommandLine 
        command={command} 
        setCommand={setCommand} 
        onExecute={executeCommand}
        commandHistory={commandHistory}
      />
      
      <StatusBar 
        fileInfo={currentFileInfo} 
        statusMessage={statusMessage}
      />
      
      <ControlButtons 
        onNewCommand={setCommand}
      />
      
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;
