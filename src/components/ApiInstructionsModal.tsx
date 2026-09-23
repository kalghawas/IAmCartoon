import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  BookOpen,
  Key,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AIProviderId, AIProviderInfo } from '../types';
import { AI_PROVIDERS } from '../utils/aiProviders';

interface ApiInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProviderId: AIProviderId;
  onSelectProvider: (providerId: AIProviderId) => void;
}

export const ApiInstructionsModal: React.FC<ApiInstructionsModalProps> = ({
  isOpen,
  onClose,
  selectedProviderId,
  onSelectProvider
}) => {
  const [activeTab, setActiveTab] = useState<AIProviderId>(selectedProviderId);

  // Synchronize active tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(selectedProviderId);
    }
  }, [isOpen, selectedProviderId]);

  if (!isOpen) return null;

  const currentProvider =
    AI_PROVIDERS.find((p) => p.id === activeTab) || AI_PROVIDERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-cartoon flex items-center gap-2">
                Simple Guide: How to Get an AI API Key
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step instructions written for anyone to easily follow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close guide"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs Header */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {AI_PROVIDERS.map((provider) => {
            const isSelected = provider.id === activeTab;
            return (
              <button
                key={provider.id}
                onClick={() => setActiveTab(provider.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{provider.name.split('(')[0].trim()}</span>
                {provider.isFreeAvailable && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    Free
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Provider Overview Header Box */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-blue-300 font-cartoon flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                {currentProvider.stepByStepGuide.title}
              </h4>
              <a
                href={currentProvider.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Go to official website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentProvider.tagline}
            </p>
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Important Safety Notice: </span>
              {currentProvider.stepByStepGuide.warningNote}
            </div>
          </div>

          {/* Numbered Steps */}
          <div className="space-y-3.5">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Follow these simple steps:
            </h5>

            {currentProvider.stepByStepGuide.steps.map((step) => (
              <div
                key={step.number}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5"
              >
                {/* Step Number Circle */}
                <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {step.number}
                </div>

                {/* Step Details */}
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-medium text-slate-100 leading-relaxed">
                    {step.instruction}
                  </p>

                  {step.actionUrl && (
                    <div className="pt-1">
                      <a
                        href={step.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                      >
                        <span>{step.actionUrlLabel || 'Open Link in New Tab'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 mt-1.5 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">What to expect:</strong> {step.whatHappens}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Models Available for this provider */}
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Models available for {currentProvider.name.split('(')[0].trim()}:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentProvider.models.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-slate-200 font-mono">
                        {m.id}
                      </span>
                      {m.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {m.qualityDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:px-4 sm:py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectProvider(activeTab);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Use {currentProvider.name.split('(')[0].trim()} in Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
