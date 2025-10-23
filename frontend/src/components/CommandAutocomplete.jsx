import React, { useEffect, useRef } from 'react';
import { Card } from './Card';

const CommandAutocomplete = ({ 
  commands, 
  isOpen, 
  position, 
  searchQuery, 
  selectedIndex, 
  onSelect, 
  onClose 
}) => {
  const containerRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  if (!isOpen || commands.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Card className="w-80 max-h-96 overflow-hidden shadow-lg border-border bg-card">
        <div className="overflow-y-auto max-h-80 scrollbar-thin">
          {commands.map((cmd, index) => (
            <div
              key={cmd.command}
              ref={index === selectedIndex ? selectedItemRef : null}
              className={`px-4 py-2.5 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => {}}
            >
              <div className="flex items-start gap-3">
                <div className="text-lg mt-0.5 min-w-[1.5rem] text-center">
                  {cmd.symbol || '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">
                    {cmd.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {cmd.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>↑↓ navigate</span>
            <span>•</span>
            <span>Enter select</span>
            <span>•</span>
            <span>Esc close</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommandAutocomplete;

