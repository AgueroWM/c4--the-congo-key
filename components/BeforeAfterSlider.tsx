import React, { useState, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  label?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeImage, afterImage, label }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newWidth = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setWidth(newWidth);
  }, [isResizing]);

  // Touch support
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const newWidth = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setWidth(newWidth);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[420px] md:h-[560px] overflow-hidden cursor-col-resize select-none shadow-2xl border border-white/10 group bg-slate-950"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={afterImage} 
          alt="Visuel de démonstration après travaux" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur text-white text-xs tracking-widest uppercase font-bold border-l-2 border-yellow-500">
          Projection
        </div>
      </div>

      {/* Before Image (Foreground - Clipped) */}
      <div 
        className="absolute inset-0 h-full shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ clipPath: `inset(0 ${100 - width}% 0 0)` }}
      >
        <div className="absolute inset-0 w-full h-full bg-slate-900">
           {/* We simulate the 'before' image or 3D wireframe often by using a grayscale or filtered version if actual before/after pair isn't available, but here we assume props passed are distinct */}
           <img 
            src={beforeImage} 
            alt="Visuel de démonstration avant travaux" 
            className="w-full h-full object-cover grayscale opacity-80"
           />
           <div className="absolute inset-0 bg-slate-950/10"></div>
        </div>
        <div className="absolute bottom-6 left-6 px-4 py-2 bg-yellow-500/90 backdrop-blur text-slate-900 text-xs tracking-widest uppercase font-bold">
          État initial
        </div>
      </div>

      {/* Handle Line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] pointer-events-none"
        style={{ left: `calc(${width}% - 1px)` }}
      ></div>

      {/* Handle Button */}
      <div 
        className="absolute top-0 bottom-0 w-8 -ml-4 bg-transparent cursor-col-resize flex items-center justify-center z-10"
        style={{ left: `${width}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsResizing(true)}
      >
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95">
          <MoveHorizontal className="text-slate-900 w-5 h-5" />
        </div>
      </div>
      
      {label && (
        <div className="absolute top-6 left-6 z-20">
          <h3 className="max-w-[80%] rounded-md bg-slate-950/70 px-4 py-3 text-xl md:text-2xl font-display text-white shadow-lg backdrop-blur">
            {label}
          </h3>
        </div>
      )}
    </div>
  );
};
