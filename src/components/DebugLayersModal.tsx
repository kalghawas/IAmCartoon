import React, { useState } from 'react';
import { X, Layers, Eye, Download, Info } from 'lucide-react';
import { OfflineDebugLayers } from '../types';

interface DebugLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugLayers: OfflineDebugLayers | null | undefined;
}

type LayerKey = keyof OfflineDebugLayers;

const LAYER_CONFIG: { id: LayerKey; title: string; description: string; badge: string }[] = [
  {
    id: 'original',
    title: '1. Original Image',
    description: 'Scaled input normalized to working resolution (max 1600px)',
    badge: 'Input'
  },
  {
    id: 'faceAndLandmarks',
    title: '2. Face & Landmarks',
    description: 'Detected face bounding box (green), eye centers, nose tip, mouth (red), and jawline arc (blue)',
    badge: 'Detection'
  },
  {
    id: 'subjectMask',
    title: '3. Subject Foreground Mask',
    description: 'Foreground separation separating portrait subject from ambient backdrop',
    badge: 'Segmentation'
  },
  {
    id: 'backgroundMask',
    title: '4. Background Mask',
    description: 'Inverted backdrop region target for smoothing or backdrop replacement',
    badge: 'Segmentation'
  },
  {
    id: 'skinMask',
    title: '5. Skin Region Mask',
    description: 'Calibrated chromaticity (YCbCr + HSV) locus identifying skin tones',
    badge: 'Color Locus'
  },
  {
    id: 'hairMask',
    title: '6. Hair Mass Mask',
    description: 'Head envelope and crown region identified as hair volume',
    badge: 'Segmentation'
  },
  {
    id: 'toneBands',
    title: '7. Cel-Shading Tone Bands',
    description: 'Discrete luminance bands: Highlight (warm), Midtone (flat base), and Cel Shadow',
    badge: 'Cel Shading'
  },
  {
    id: 'structuralEdges',
    title: '8. Structural Contours',
    description: 'Selective edge inking (silhouette, eyes, jawline, nostrils, collar) suppressing skin pores',
    badge: 'Inking'
  },
  {
    id: 'colorQuantized',
    title: '9. Quantized Color Plates',
    description: 'Pre-inked color fields showing region-specific palette abstraction',
    badge: 'Quantization'
  },
  {
    id: 'finalComposite',
    title: '10. Final Composite',
    description: 'Full illustrated cartoon output with graded contours and background treatment',
    badge: 'Composite'
  }
];

export const DebugLayersModal: React.FC<DebugLayersModalProps> = ({ isOpen, onClose, debugLayers }) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerKey>('faceAndLandmarks');

  if (!isOpen) return null;

  const currentLayerInfo = LAYER_CONFIG.find((l) => l.id === selectedLayer) || LAYER_CONFIG[0];
  const activeImageUrl = debugLayers ? debugLayers[selectedLayer] : undefined;

  const handleDownloadActive = () => {
    if (!activeImageUrl) return;
    const a = document.createElement('a');
    a.href = activeImageUrl;
    a.download = `debug-layer-${selectedLayer}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-cartoon text-white">Developer Vision Inspector</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  NPR Pipeline Debug
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect 10 intermediate computer vision, segmentation, cel-shading, and inking stages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeImageUrl && (
              <button
                type="button"
                onClick={handleDownloadActive}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Download this layer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Layer</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Layer Select List */}
          <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Pipeline Stages
            </div>

            {LAYER_CONFIG.map((layer) => {
              const isSelected = selectedLayer === layer.id;
              const hasData = debugLayers && !!debugLayers[layer.id];

              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayer(layer.id)}
                  disabled={!hasData}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500/80 text-white shadow-sm shadow-purple-500/10'
                      : hasData
                      ? 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{layer.title}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {layer.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{layer.description}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Main Layer Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-hidden">
            {/* Layer description bar */}
            <div className="mb-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  {currentLayerInfo.title}
                  <span className="text-[10px] font-normal text-purple-300/80 font-mono">
                    [{currentLayerInfo.badge}]
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{currentLayerInfo.description}</p>
              </div>
            </div>

            {/* Canvas/Image display */}
            <div className="flex-1 rounded-xl bg-slate-900 border border-slate-800/90 overflow-hidden flex items-center justify-center relative p-2">
              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt={currentLayerInfo.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <Eye className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-medium text-slate-400">No data available for this layer</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Generate or re-process an image with Developer Debug Mode enabled in Offline Settings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
