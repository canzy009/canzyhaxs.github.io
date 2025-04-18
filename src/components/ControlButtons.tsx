
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  ArrowLeft,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Keyboard
} from 'lucide-react';

interface ControlButtonsProps {
  onNewCommand: (cmd: string) => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({ onNewCommand }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 p-2 flex flex-wrap gap-2 justify-center md:justify-between animate-slide-in-up">
      <div className="flex space-x-1">
        <KeyboardButton 
          label="ESC" 
          onClick={() => onNewCommand('exit')} 
        />
        <KeyboardButton 
          label="/" 
          onClick={() => onNewCommand('help')} 
        />
        <KeyboardButton 
          label="HOME" 
          onClick={() => onNewCommand('?')} 
          className="hidden md:flex"
        />
        <KeyboardButton 
          label="END" 
          onClick={() => onNewCommand('save')} 
          className="hidden md:flex"
        />
      </div>
      
      <div className="flex space-x-1">
        <Keyboard className="h-6 w-6 text-gray-500" />
        <span className="text-gray-500 text-sm">CTRL</span>
        <span className="text-gray-500 text-sm ml-4">ALT</span>
        <Keyboard className="h-6 w-6 ml-4 text-gray-500" />
      </div>
      
      <div className="hidden md:flex space-x-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface KeyboardButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const KeyboardButton: React.FC<KeyboardButtonProps> = ({ label, onClick, className }) => {
  return (
    <Button 
      variant="outline"
      onClick={onClick}
      className={`h-8 px-3 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white ${className || ''}`}
    >
      {label}
    </Button>
  );
};

export default ControlButtons;
