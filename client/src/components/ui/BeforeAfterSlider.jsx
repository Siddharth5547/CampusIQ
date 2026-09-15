import { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';

const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before Repair',
  afterLabel = 'After Resolution',
  className = ''
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className={`relative w-full h-72 md:h-96 rounded-2xl overflow-hidden select-none border border-[#DEDAD3] bg-white shadow-sm ${className}`}
    >
      {/* After image (full background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped left side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-700 text-white backdrop-blur-md shadow-md border border-red-500">
          <AlertCircle className="w-3.5 h-3.5" />
          {beforeLabel}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#8A9A5B] text-white backdrop-blur-md shadow-md border border-[#8A9A5B]/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {afterLabel}
        </span>
      </div>

      {/* Draggable Divider Line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white cursor-ew-resize shadow-[0_0_12px_rgba(0,0,0,0.8)]"
        style={{ left: `${sliderPos}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Slider Handle Knob */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-[#3B3C36] flex items-center justify-center shadow-xl border-2 border-[#9F8170] cursor-ew-resize transition-transform hover:scale-110 active:scale-95">
          <ChevronsLeftRight className="w-5 h-5 text-[#3B3C36]" />
        </div>
      </div>

      {/* Helper text on bottom */}
      <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none z-10">
        <span className="text-[11px] font-mono tracking-wide px-3 py-1 rounded-full bg-[#292A26]/80 backdrop-blur-md text-[#F7F5F0] border border-white/20">
          Drag handle to verify before vs after repair proof
        </span>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
