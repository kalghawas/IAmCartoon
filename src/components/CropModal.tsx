import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { CropSettings } from '../types';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onApplyCrop: (croppedDataUrl: string, settings: CropSettings) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onApplyCrop
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '3:4'>('1:1');
  const [showFaceGuide, setShowFaceGuide] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    let height = 600;
    if (aspectRatio === '4:5') height = 750;
    if (aspectRatio === '3:4') height = 800;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.max(width / img.width, height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [aspectRatio, pan.x, pan.y, rotation, zoom]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    const croppedDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    onApplyCrop(croppedDataUrl, {
      zoom,
      panX: pan.x,
      panY: pan.y,
      aspectRatio,
      rotation
    });
    onClose();
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setAspectRatio('1:1');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[95vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-cartoon">
              Center & Crop Portrait
            </h3>
            <p className="text-xs text-slate-400">
              Align eyes and face to ensure optimal character identity preservation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area with drag viewport */}
        <div
          className="relative flex-1 bg-slate-950 flex items-center justify-center p-3 sm:p-4 overflow-hidden select-none cursor-move min-h-[260px] sm:min-h-[340px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="relative max-h-[50vh] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-h-[50vh] max-w-full object-contain rounded-xl border-2 border-blue-500/50 shadow-2xl shadow-black/80"
            />

            {/* Facial Landmark Alignment Overlay (Oval Guide) */}
            {showFaceGuide && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-40 h-52 sm:w-48 sm:h-64 rounded-[50%] border-2 border-dashed border-blue-400/80 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  {/* Eye alignment guide line */}
                  <div className="absolute top-[38%] inset-x-0 border-t border-blue-400/60 flex justify-between px-6">
                    <div className="w-3 h-3 -mt-1.5 rounded-full border border-blue-300 bg-blue-500/20" />
                    <div className="w-3 h-3 -mt-1.5 rounded-full border border-blue-300 bg-blue-500/20" />
                  </div>
                  {/* Vertical nose/mouth center axis */}
                  <div className="absolute inset-y-0 left-1/2 border-l border-blue-400/40" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aspect Ratio Selector Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium">Aspect Ratio:</span>
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['1:1', '4:5', '3:4'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  aspectRatio === ratio
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar Controls: Icon-First */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Zoom Slider */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20 sm:w-24 accent-blue-600 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 w-10">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Rotate */}
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5"
              title="Rotate 90 degrees"
              aria-label="Rotate"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">Rotate</span>
            </button>

            {/* Toggle Guide */}
            <button
              onClick={() => setShowFaceGuide((g) => !g)}
              className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
                showFaceGuide
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle Face Alignment Guide"
              aria-label="Toggle Face Guide"
            >
              {showFaceGuide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="hidden sm:inline">Guide</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleReset}
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
              title="Reset All Adjustments"
              aria-label="Reset All"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
              title="Apply Crop"
              aria-label="Apply Crop"
            >
              <Check className="w-4 h-4" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
