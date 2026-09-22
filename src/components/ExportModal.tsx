import React, { useState } from 'react';
import {
  Download,
  X,
  CheckCircle2,
  FileVideo,
  Image as ImageIcon,
  Film,
  Sparkles,
  RefreshCw,
  Sliders,
  Share2,
} from 'lucide-react';
import { ExportProgress, ExportFormat, ExportResolution } from '../types';
import { getResolutionConfig } from '../utils/videoRecorder';
import { ShareModal } from './ShareModal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelRecording: () => void;
  exportProgress: ExportProgress | null;
  format: ExportFormat;
  onChangeFormat: (fmt: ExportFormat) => void;
  resolution: ExportResolution;
  onChangeResolution: (res: ExportResolution) => void;
  contactName: string;
  senderName?: string;
  onDownloaded?: () => void;
  onStartExport?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onCancelRecording,
  exportProgress,
  format,
  onChangeFormat,
  resolution,
  onChangeResolution,
  contactName,
  senderName = 'Me',
  onDownloaded,
  onStartExport,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!isOpen) return null;

  const isRecording = exportProgress?.isRecording || false;
  const isComplete = !isRecording && exportProgress?.recordedBlobUrl !== null && exportProgress?.recordedBlobUrl !== undefined;
  const activeFormat = exportProgress?.format || format;
  const activeResolution = exportProgress?.resolution || resolution;

  const handleDownload = () => {
    if (!exportProgress?.recordedBlobUrl) return;
    const a = document.createElement('a');
    a.href = exportProgress.recordedBlobUrl;
    const safeName = contactName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Chat';
    const ext = activeFormat === 'gif' ? 'gif' : 'mp4';
    a.download = `IAmWhatsApp_${safeName}_${activeResolution}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onDownloaded?.();
  };

  const resolutions: { key: ExportResolution; label: string; desc: string }[] = [
    { key: '1080p', label: '1080p', desc: 'Full HD • 1080×1920' },
    { key: '720p', label: '720p', desc: 'HD • 720×1280' },
    { key: '480p', label: '480p', desc: 'SD • 480×854' },
    { key: '360p', label: '360p', desc: 'Low • 360×640' },
  ];

  return (
    <>
      <div
        id="export-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      >
        <div
          id="export-modal-content"
          className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {activeFormat === 'gif' ? (
                  <ImageIcon className="w-5 h-5" />
                ) : (
                  <FileVideo className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  {isRecording
                    ? `Rendering ${activeFormat.toUpperCase()} (${activeResolution})`
                    : isComplete
                    ? `${activeFormat.toUpperCase()} Ready for Download & Sharing`
                    : 'Export Video / GIF'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isRecording
                    ? 'Rendering frame-by-frame in-browser with zero upload delay'
                    : isComplete
                    ? 'Processed 100% client-side with full resolution fidelity'
                    : 'Choose format and quality to generate your chat animation'}
                </p>
              </div>
            </div>

            {!isRecording && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-5">
            {/* Format & Resolution Selection Controls (Enabled when not recording) */}
            {!isRecording && (
              <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                {/* Format Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeFormat('mp4')}
                      className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        format === 'mp4'
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 ring-1 ring-emerald-500'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      <span>MP4 Video (60 FPS)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeFormat('gif')}
                      className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        format === 'gif'
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400 ring-1 ring-cyan-500'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Animated GIF</span>
                    </button>
                  </div>
                </div>

                {/* Quality / Resolution Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Quality / Resolution
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {resolutions.map((res) => {
                      const isSelected = resolution === res.key;
                      return (
                        <button
                          key={res.key}
                          type="button"
                          onClick={() => onChangeResolution(res.key)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-xs font-bold block">{res.label}</span>
                          <span className="text-[9.5px] opacity-75 block truncate mt-0.5">
                            {res.key === '1080p'
                              ? 'Full HD'
                              : res.key === '720p'
                              ? 'HD'
                              : res.key === '480p'
                              ? 'SD'
                              : 'Compact'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* While Recording Progress Bar */}
            {isRecording && exportProgress && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 font-medium flex items-center gap-2 text-xs">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    {exportProgress.statusText}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {exportProgress.progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-200 shadow-sm shadow-emerald-500/50"
                    style={{ width: `${exportProgress.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>
                    Frame {exportProgress.currentFrame} / {exportProgress.totalFrames}
                  </span>
                  <span>
                    {activeFormat === 'gif' ? 'Quantized 256 Palette GIF' : 'Canvas Stream (60 FPS)'}
                  </span>
                </div>

                {/* Cancel Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={onCancelRecording}
                    className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    Cancel Export
                  </button>
                </div>
              </div>
            )}

            {/* After Recording Completed */}
            {isComplete && exportProgress && (
              <div className="space-y-4">
                {/* Success Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-medium">
                      {activeFormat.toUpperCase()} generated in {activeResolution}!
                    </span>
                  </div>
                  {exportProgress.fileSizeMb !== undefined && (
                    <span className="font-mono font-semibold">
                      {exportProgress.fileSizeMb} MB
                    </span>
                  )}
                </div>

                {/* Video / GIF Player Preview */}
                <div className="relative w-full max-h-[340px] aspect-[9/16] mx-auto bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-lg flex items-center justify-center">
                  {activeFormat === 'gif' ? (
                    <img
                      src={exportProgress.recordedBlobUrl || ''}
                      alt="Rendered GIF"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={exportProgress.recordedBlobUrl || ''}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Action Buttons: Download, Share, Re-Render */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="py-3 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-950/30 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  {onStartExport ? (
                    <button
                      type="button"
                      onClick={onStartExport}
                      className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-Render</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Sub-Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`${contactName} WhatsApp Chat`}
        senderName={senderName}
        contactName={contactName}
        format={activeFormat}
        blobUrl={exportProgress?.recordedBlobUrl}
        appThemeMode="dark"
      />
    </>
  );
};

