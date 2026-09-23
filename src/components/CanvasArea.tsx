import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SplitSquareVertical,
  Columns,
  Image as ImageIcon,
  Check,
  Sparkles,
  UploadCloud,
  Crown,
  Share2
} from 'lucide-react';
import { ViewComparisonMode, GenerationStep, ArtStyle, PoseOption } from '../types';
import { ShareModal } from './ShareModal';

interface CanvasAreaProps {
  originalImage: string | null;
  generatedImage: string | null;
  artStyle: ArtStyle;
  pose: PoseOption;
  seed: number;
  isGenerating: boolean;
  generationStep: GenerationStep;
  isUnlocked: boolean;
  onOpenUnlockModal: () => void;
  onDownload: () => void;
  onCopyToClipboard: () => Promise<boolean>;
  onReset: () => void;
  onOpenUpload?: () => void;
  onToast?: (msg: string) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  originalImage,
  generatedImage,
  artStyle,
  pose,
  isGenerating,
  generationStep,
  isUnlocked,
  onOpenUnlockModal,
  onDownload,
  onCopyToClipboard,
  onReset,
  onOpenUpload,
  onToast
}) => {
  const [viewMode, setViewMode] = useState<ViewComparisonMode>('split-slider');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderFrameRef = useRef<HTMLDivElement | null>(null);

  // Reset pan/zoom when new image generated
  useEffect(() => {
    if (generatedImage) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSplitPosition(50);
    }
  }, [generatedImage]);

  // Copy handler with visual feedback
  const handleCopy = async () => {
    const success = await onCopyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3.5, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(3.5, Math.max(0.5, +(z + delta).toFixed(2))));
    }
  };

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggingSlider) return;
    if (e.button === 0 && (zoom > 1 || e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      const targetElement = sliderFrameRef.current || containerRef.current;
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
        setSplitPosition(pos);
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSlider(false);
  };

  // Touch handlers for slider drag
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSlider && e.touches[0]) {
      const targetElement = sliderFrameRef.current || containerRef.current;
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
        setSplitPosition(pos);
      }
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#0b0f17] overflow-hidden select-none"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* Top Canvas Bar - Simplified and Clean */}
      <div className="h-14 px-3 sm:px-6 border-b border-slate-800/80 bg-[#0f172a]/70 flex items-center justify-between gap-2 shrink-0">
        {/* View Mode Selectors */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setViewMode('split-slider')}
            className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'split-slider'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Split Slider Comparison"
            aria-label="Split Slider"
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span className="hidden md:inline">Split</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Side-by-Side Dual View"
            aria-label="Side by Side"
          >
            <Columns className="w-4 h-4" />
            <span className="hidden md:inline">Dual</span>
          </button>

          <button
            onClick={() => setViewMode('single-generated')}
            className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'single-generated'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Cartoon Only View"
            aria-label="Cartoon Only"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden md:inline">Cartoon</span>
          </button>
        </div>

        {/* Right Tools: Clean Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom & Screen Controls */}
          <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800/80 p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 sm:px-2 text-[11px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Reset Zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950/80 hover:bg-slate-800 rounded-xl border border-slate-800/80 transition-colors cursor-pointer"
            title="Fit to Screen"
            aria-label="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className={`relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        {/* State 1: No Portrait Uploaded Yet */}
        {!originalImage && !isGenerating && (
          <div className="flex flex-col items-center justify-center max-w-sm text-center p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
              <UploadCloud className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="font-cartoon text-xl font-bold text-slate-100 mb-1">
              Ready to be Cartoonized?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Upload a clear photo of yourself to begin creating your cartoon alter-ego.
            </p>
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-cartoon text-sm shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Portrait</span>
              </button>
            )}
          </div>
        )}

        {/* State 2: Portrait Uploaded, but No Cartoon Rendered Yet */}
        {originalImage && !generatedImage && !isGenerating && (
          <div className="relative flex flex-col items-center justify-center max-w-md text-center animate-in fade-in duration-300 p-2">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900 group">
              <img
                src={originalImage}
                alt="Source Portrait"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-4 sm:p-5">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white w-fit mb-1 font-cartoon">
                  Portrait Ready
                </span>
                <p className="text-xs text-slate-300 text-left">
                  Click &ldquo;I Am Cartoon&rdquo; on the left to transform your photo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 3: View Mode 1 - Split Slider Curtain */}
        {originalImage && generatedImage && viewMode === 'split-slider' && (
          <div
            ref={sliderFrameRef}
            className="relative w-full max-w-4xl aspect-square max-h-[calc(100vh-220px)] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 transition-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Base Underneath Layer: Generated Cartoon */}
            <img
              src={generatedImage}
              alt="Generated Cartoon"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-blue-950/80 backdrop-blur-md border border-blue-500/40 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-blue-300 shadow-md pointer-events-none font-cartoon">
              Cartoon
            </div>

            {/* Top Revealing Layer: Original Photo Clipped by split position */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none border-r-2 border-blue-500"
              style={{ width: `${splitPosition}%` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  width: sliderFrameRef.current?.offsetWidth
                    ? `${sliderFrameRef.current.offsetWidth}px`
                    : '100%',
                  height: '100%'
                }}
              >
                <img
                  src={originalImage}
                  alt="Original Portrait"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-slate-200 shadow-md">
                Photo
              </div>
            </div>

            {/* Interactive Draggable Split Handle Line */}
            <div
              className="absolute top-0 bottom-0 z-20 w-1 bg-blue-500 cursor-ew-resize flex items-center justify-center group"
              style={{ left: `${splitPosition}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingSlider(true);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsDraggingSlider(true);
              }}
            >
              <div className="w-8 h-8 -ml-3.5 rounded-full bg-slate-900 border-2 border-blue-400 shadow-xl flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-3 bg-blue-400 rounded-full" />
                  <div className="w-0.5 h-3 bg-blue-400 rounded-full" />
                </div>
              </div>
            </div>

            {/* Watermark Overlay on Preview - Positioned High Top-Left */}
            {!isUnlocked && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-blue-500/40 text-[10px] sm:text-[11px] font-medium text-slate-200 shadow-lg">
                  ✨ I Am Cartoon • Free Preview
                </div>
                <button
                  type="button"
                  onClick={onOpenUnlockModal}
                  className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-bold shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Crown className="w-3 h-3" />
                  <span>Remove Watermark ($0.99)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 4: View Mode 2 - Side-by-Side Dual View */}
        {originalImage && generatedImage && viewMode === 'side-by-side' && (
          <div
            className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 transition-transform max-h-[calc(100vh-220px)] overflow-hidden"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl">
              <img
                src={originalImage}
                alt="Source Portrait"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-200 shadow-md">
                Original Photo
              </div>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden border border-blue-500/50 bg-slate-950 shadow-xl shadow-blue-950/30">
              <img
                src={generatedImage}
                alt="Stylized Cartoon Character"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 right-3 bg-blue-950/80 backdrop-blur-md border border-blue-500/40 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-300 shadow-md font-cartoon">
                Cartoon Character
              </div>

              {/* Watermark Overlay on Top-Left */}
              {!isUnlocked && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-blue-500/40 text-[10px] text-slate-200 shadow-md">
                    ✨ I Am Cartoon
                  </div>
                  <button
                    type="button"
                    onClick={onOpenUnlockModal}
                    className="px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold cursor-pointer shadow-md"
                  >
                    Unlock HD
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* State 5: View Mode 3 - Single Character View */}
        {generatedImage && viewMode === 'single-generated' && (
          <div
            className="relative w-full max-w-4xl aspect-square max-h-[calc(100vh-220px)] rounded-2xl overflow-hidden border border-blue-500/40 shadow-2xl bg-slate-950 transition-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <img
              src={generatedImage}
              alt="Stylized Cartoon Character"
              className="w-full h-full object-contain pointer-events-none"
            />
            <div className="absolute top-3 right-3 bg-blue-950/80 backdrop-blur-md border border-blue-500/40 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold text-blue-300 shadow-md font-cartoon">
              {artStyle.name} • {pose.label}
            </div>

            {/* Watermark Overlay on Top-Left */}
            {!isUnlocked && (
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-blue-500/40 text-[11px] text-slate-200 shadow-md">
                  ✨ I Am Cartoon • Free Preview
                </div>
                <button
                  type="button"
                  onClick={onOpenUnlockModal}
                  className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <Crown className="w-3 h-3" />
                  <span>Remove Watermark ($0.99)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Multi-step Interactive Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Animated Scanning Effect */}
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border border-blue-500/50 shadow-2xl shadow-blue-500/20 bg-slate-900 mb-5 flex items-center justify-center">
              {originalImage ? (
                <img
                  src={originalImage}
                  alt="Source preview"
                  className="w-full h-full object-cover opacity-60 filter contrast-125"
                />
              ) : (
                <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
              )}

              {/* Laser scanning bar */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#60a5fa] animate-pulse-scan" />

              {/* Glowing center badge */}
              <div className="absolute p-3 rounded-2xl bg-slate-950/80 border border-blue-500/40 text-blue-400 animate-spin-slow shadow-xl">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            {/* Step-by-step Status Message */}
            <div className="w-full max-w-sm space-y-2.5 text-center px-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  Step {generationStep.step} of 4
                </span>
                <span className="font-mono text-blue-400">{generationStep.percentage}%</span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${generationStep.percentage}%` }}
                />
              </div>

              <p className="text-sm font-medium text-slate-200 animate-pulse font-cartoon">
                {generationStep.label}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Canvas Action Bar */}
      <div className="h-16 px-3 sm:px-6 border-t border-slate-800/80 bg-[#0f172a]/95 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset Canvas and create fresh character"
            aria-label="Reset Canvas"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Export and Unlock Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {generatedImage && !isUnlocked && (
            <button
              type="button"
              onClick={onOpenUnlockModal}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Remove watermark & unlock HD"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Unlock HD ($0.99)</span>
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            disabled={!generatedImage}
            className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
              !generatedImage
                ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-blue-500/50 active:scale-[0.98]'
            }`}
            title="Share Character on Social Media"
            aria-label="Share Character"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!generatedImage}
            className={`p-2.5 sm:px-4 sm:py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
              !generatedImage
                ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                : copied
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-blue-500/50 active:scale-[0.98]'
            }`}
            title="Copy Character Image"
            aria-label="Copy Character Image"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={onDownload}
            disabled={!generatedImage}
            className={`p-2.5 sm:px-5 sm:py-2 rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              !generatedImage
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-[0.98]'
            }`}
            title={isUnlocked ? "Download Clean 4K PNG" : "Download PNG (with watermark)"}
            aria-label="Download PNG"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isUnlocked ? 'Download 4K PNG' : 'Download PNG'}
            </span>
          </button>
        </div>
      </div>

      {/* Social & Link Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageUrl={generatedImage}
        artStyle={artStyle}
        pose={pose}
        onToast={onToast || (() => {})}
      />
    </div>
  );
};
