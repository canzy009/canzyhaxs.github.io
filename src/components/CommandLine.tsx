
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface CommandLineProps {
  command: string;
  setCommand: (cmd: string) => void;
  onExecute: (cmd: string) => void;
  commandHistory: string[];
}

const CommandLine: React.FC<CommandLineProps> = ({ 
  command, 
  setCommand, 
  onExecute,
  commandHistory 
}) => {
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistoryIndex(-1);
  }, [commandHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      onExecute(command.trim());
    } else if (e.key === 'ArrowUp') {
      // Navigate up in command history
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      // Navigate down in command history
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="bg-gray-800 border-t border-gray-700 p-2"
      onClick={focusInput}
    >
      <div className="flex items-center bg-gray-900 rounded px-3 py-2 font-mono text-sm animate-fade-in">
        <ArrowRight className="h-4 w-4 text-teal-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (help, ?, load, save, edit, exit)..."
          className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
        />
      </div>
      
      {commandHistory.length > 0 && (
        <div className="mt-1 px-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
          {commandHistory.slice(-5).map((cmd, index) => (
            <div 
              key={index} 
              className="text-xs text-gray-500 font-mono animate-fade-in opacity-70 hover:opacity-100 cursor-pointer"
              onClick={() => setCommand(cmd)}
            >
              <span className="text-gray-600 mr-1">$</span> {cmd}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommandLine;
