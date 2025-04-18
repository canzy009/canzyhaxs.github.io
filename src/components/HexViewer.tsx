
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsUp, ChevronsDown } from 'lucide-react';

interface HexViewerProps {
  data: ArrayBuffer;
  activeAddress: number;
  editMode: boolean;
  onAddressChange: (address: number) => void;
}

const HexViewer: React.FC<HexViewerProps> = ({ 
  data, 
  activeAddress, 
  editMode, 
  onAddressChange
}) => {
  const [offset, setOffset] = useState(0);
  const [bytesPerRow] = useState(16);
  const [visibleRows] = useState(20);
  const [hexValues, setHexValues] = useState<Uint8Array>(new Uint8Array());
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const bytes = new Uint8Array(data);
    setHexValues(bytes);
  }, [data]);
  
  useEffect(() => {
    // Ensure activeAddress is visible by adjusting offset
    const rowOfActiveAddress = Math.floor(activeAddress / bytesPerRow);
    if (rowOfActiveAddress < offset) {
      setOffset(rowOfActiveAddress);
    } else if (rowOfActiveAddress >= offset + visibleRows) {
      setOffset(rowOfActiveAddress - visibleRows + 1);
    }
    
    // Initialize edit value
    if (editMode && activeAddress < hexValues.length) {
      setEditValue(hexValues[activeAddress].toString(16).padStart(2, '0'));
      setTimeout(() => editInputRef.current?.focus(), 100);
    }
  }, [activeAddress, editMode, bytesPerRow, offset, visibleRows, hexValues]);
  
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newValue = parseInt(editValue, 16);
      if (!isNaN(newValue) && newValue >= 0 && newValue <= 255) {
        const newHexValues = new Uint8Array(hexValues);
        newHexValues[activeAddress] = newValue;
        setHexValues(newHexValues);
        
        // Move to next address
        onAddressChange(Math.min(activeAddress + 1, hexValues.length - 1));
      }
    } else if (e.key === 'Escape') {
      onAddressChange(activeAddress); // Just refresh without saving
    }
  };
  
  const handleOffsetChange = (delta: number) => {
    const newOffset = Math.max(0, Math.min(offset + delta, Math.floor(hexValues.length / bytesPerRow) - visibleRows + 1));
    setOffset(newOffset);
  };
  
  const handleByteClick = (address: number) => {
    onAddressChange(address);
  };
  
  // Convert byte to ASCII character (printable only)
  const byteToChar = (byte: number): string => {
    if (byte >= 32 && byte <= 126) { // Printable ASCII range
      return String.fromCharCode(byte);
    }
    return '.'; // Non-printable
  };
  
  // Format address as 8-digit hex
  const formatAddress = (address: number): string => {
    return address.toString(16).padStart(8, '0');
  };
  
  // Generate rows to display
  const getVisibleRows = () => {
    const rows = [];
    
    for (let i = 0; i < visibleRows; i++) {
      const rowOffset = offset + i;
      const startAddress = rowOffset * bytesPerRow;
      
      if (startAddress >= hexValues.length) break;
      
      const rowBytes: number[] = [];
      for (let j = 0; j < bytesPerRow; j++) {
        const address = startAddress + j;
        if (address < hexValues.length) {
          rowBytes.push(hexValues[address]);
        } else {
          rowBytes.push(-1); // Out of range
        }
      }
      
      rows.push({ startAddress, bytes: rowBytes });
    }
    
    return rows;
  };

  return (
    <div className="w-full h-full font-mono text-sm">
      <div className="flex items-center justify-end mb-1 px-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleOffsetChange(-10)} 
          className="h-6 w-6 mr-1 text-gray-400 hover:text-white"
        >
          <ChevronsUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleOffsetChange(-1)} 
          className="h-6 w-6 mr-1 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleOffsetChange(1)} 
          className="h-6 w-6 mr-1 text-gray-400 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleOffsetChange(10)} 
          className="h-6 w-6 text-gray-400 hover:text-white"
        >
          <ChevronsDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative overflow-x-auto">
        <div className="sticky top-0 flex px-4 py-1 bg-gray-800 text-gray-400 text-xs border-b border-gray-700">
          <div className="w-24">Address</div>
          <div className="flex-1 flex">
            {Array(bytesPerRow).fill(0).map((_, i) => (
              <div key={i} className="w-6 text-center">{i.toString(16).padStart(2, '0').toUpperCase()}</div>
            ))}
          </div>
          <div className="w-32 pl-2">ASCII</div>
        </div>
        
        <div className="relative">
          {getVisibleRows().map(row => (
            <div 
              key={row.startAddress} 
              className="flex px-4 py-1 hover:bg-gray-700/30 border-b border-gray-700/50 group animate-fade-in"
            >
              <div className="w-24 text-teal-400">{formatAddress(row.startAddress)}</div>
              <div className="flex-1 flex">
                {row.bytes.map((byte, i) => {
                  const address = row.startAddress + i;
                  const isActive = address === activeAddress;
                  const isEditing = isActive && editMode;
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "w-6 text-center group-hover:bg-opacity-50",
                        {
                          "text-gray-500": byte === -1, // Out of range
                          "bg-blue-500/30 text-white": isActive && !isEditing,
                          "bg-teal-500/30": isEditing,
                          "cursor-pointer hover:bg-gray-600/30": !isEditing && byte !== -1,
                        }
                      )}
                      onClick={() => byte !== -1 && handleByteClick(address)}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => {
                            // Allow only valid hex characters and limit length
                            const value = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 2);
                            setEditValue(value);
                          }}
                          onKeyDown={handleEditKeyDown}
                          className="w-full h-full bg-transparent text-center text-white focus:outline-none"
                          maxLength={2}
                        />
                      ) : (
                        byte !== -1 ? byte.toString(16).padStart(2, '0') : ''
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="w-32 pl-2 text-gray-300">
                {row.bytes.map((byte, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-block",
                      {
                        "text-blue-300": row.startAddress + i === activeAddress,
                        "text-gray-500": byte === -1, // Out of range
                      }
                    )}
                  >
                    {byte !== -1 ? byteToChar(byte) : ' '}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-2 px-4 text-xs text-gray-400">
        Showing bytes {offset * bytesPerRow} to {Math.min((offset + visibleRows) * bytesPerRow, hexValues.length)} of {hexValues.length}
      </div>
    </div>
  );
};

export default HexViewer;
