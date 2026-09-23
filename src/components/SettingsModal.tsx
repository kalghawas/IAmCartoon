import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Cpu,
  Sliders,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  Info,
  HelpCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Pencil,
  ChevronDown
} from 'lucide-react';
import { AppSettings, AIProviderId, UserProfile } from '../types';
import { DEFAULT_SYSTEM_PROMPT } from '../utils/constants';
import { AI_PROVIDERS } from '../utils/aiProviders';
import { ApiInstructionsModal } from './ApiInstructionsModal';
import { User, LogOut, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const [provider, setProvider] = useState<AIProviderId>(settings.provider || 'google');
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [useMockMode, setUseMockMode] = useState(settings.useMockMode);
  const [model, setModel] = useState<string>(settings.model || 'gemini-3.1-flash-image');
  const [aspectRatio, setAspectRatio] = useState(settings.aspectRatio);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt || DEFAULT_SYSTEM_PROMPT);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPromptLocked, setIsPromptLocked] = useState(true);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // Synchronize when opened
  useEffect(() => {
    if (isOpen) {
      setProvider(settings.provider || 'google');
      setApiKey(settings.geminiApiKey || '');
      setUseMockMode(settings.useMockMode);
      setModel(settings.model || 'gemini-3.1-flash-image');
      setAspectRatio(settings.aspectRatio);
      setSystemPrompt(settings.systemPrompt || DEFAULT_SYSTEM_PROMPT);
      setIsPromptLocked(true);
      setTestResult(null);
    }
  }, [isOpen, settings]);

  const activeProviderInfo =
    AI_PROVIDERS.find((p) => p.id === provider) || AI_PROVIDERS[0];

  // If provider changes and current model isn't in new provider's list, auto-select first model
  const handleProviderChange = (newProvider: AIProviderId) => {
    setProvider(newProvider);
    setTestResult(null);
    const targetInfo = AI_PROVIDERS.find((p) => p.id === newProvider) || AI_PROVIDERS[0];
    if (targetInfo.models.length > 0) {
      const modelExists = targetInfo.models.some((m) => m.id === model);
      if (!modelExists) {
        setModel(targetInfo.models[0].id);
      }
    }
  };

  if (!isOpen) return null;

  const handleTestKey = async (modelToTest?: string) => {
    const targetModel = modelToTest || model;
    if (provider !== 'pollinations' && !apiKey.trim()) {
      setTestResult({ status: 'error', message: `Please enter an API key for ${activeProviderInfo.name}.` });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey.trim(),
          'x-ai-provider': provider,
          'x-ai-model': targetModel
        },
        body: JSON.stringify({
          provider,
          model: targetModel,
          apiKey: apiKey.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResult({
          status: 'success',
          message: data.message || `✅ Model "${targetModel}" is active and verified!`
        });
      } else {
        setTestResult({
          status: 'error',
          message: `❌ ${data.error || 'Invalid API Key or model unavailable'}`
        });
      }
    } catch (e: any) {
      setTestResult({ status: 'error', message: `❌ Connection error: ${e.message || 'Unable to connect to verification server'}` });
    } finally {
      setIsTestingKey(false);
    }
  };

  // When user clicks a model, select it and automatically verify the selected model if key exists or if free provider
  const handleModelSelect = (newModelId: string) => {
    setModel(newModelId);
    if (apiKey.trim() || provider === 'pollinations') {
      handleTestKey(newModelId);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      provider,
      geminiApiKey: apiKey.trim(),
      useMockMode,
      model,
      aspectRatio,
      systemPrompt: systemPrompt.trim() || DEFAULT_SYSTEM_PROMPT
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
        <div
          className="relative flex flex-col w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-cartoon">AI Engine Settings</h3>
                <p className="text-xs text-slate-400">
                  Select your AI provider, manage API keys, or use instant Offline Mock Mode
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close dialog"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
            {/* Studio Account Status */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-cartoon font-bold">
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200 font-cartoon">
                    {currentUser ? currentUser.name : 'Studio Account'}
                  </div>
                  <p className="text-xs text-slate-400">
                    {currentUser ? currentUser.email : 'Sign in to sync 3 monthly credits & save variations'}
                  </p>
                </div>
              </div>

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onLogout) onLogout();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mock Mode Toggle */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                      useMockMode
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 flex items-center gap-2 font-cartoon">
                      Offline Mode (100% Local & Private)
                      {useMockMode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Your image is processed locally on this device and is not uploaded. Runs without calling any AI, API provider, or backend service.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={useMockMode}
                    onChange={(e) => setUseMockMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Token Usage / Fallback Warning Notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold">Automatic Offline Fallback: </strong>
                If your cloud API key runs out of quota, tokens, or network disconnects, the app seamlessly falls back to Local Offline Mode so you can still create cartoon portraits uninterrupted.
              </div>
            </div>

            {/* AI Provider Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  AI Service Provider
                </span>
                <span className="text-[11px] text-slate-400">Choose your AI platform</span>
              </label>

              <div className="relative">
                <select
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProviderId)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer pr-10"
                >
                  {AI_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100 py-1">
                      {p.name} {p.isFreeAvailable ? '— [Free Tier]' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* API Key Input Section with Instructions Guide Link */}
            {activeProviderInfo.requiresKey ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    API Key for {activeProviderInfo.name.split('(')[0].trim()}
                  </label>

                  {/* Instructions Guide Button */}
                  <button
                    type="button"
                    onClick={() => setIsGuideModalOpen(true)}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/70 hover:bg-blue-900/70 border border-blue-700/60 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <HelpCircle className="w-3 h-3 text-blue-400" />
                    <span>How to get free API key (Guide)</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      setApiKey(newKey);
                      if (newKey.trim().length > 10 && useMockMode) {
                        setUseMockMode(false);
                      }
                    }}
                    placeholder={activeProviderInfo.placeholder}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Key prefix: {activeProviderInfo.keyPrefix}</span>
                  {apiKey && (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Stored safely in local browser storage
                    </span>
                  )}
                </div>

                {/* Live Test Key Action & Status */}
                {apiKey && (
                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestKey()}
                        disabled={isTestingKey}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isTestingKey ? (
                          <>
                            <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                            <span>Testing {model}...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Test Selected Model ({model.split('/').pop()?.split('-')[0]}...)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {testResult && (
                      <div
                        className={`mt-2 p-2.5 rounded-lg text-xs font-medium border ${
                          testResult.status === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {testResult.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-cartoon">
                  <Sparkles className="w-4 h-4" />
                  <span>No API Key Required!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pollinations.AI is an open-access public neural network. You can generate unlimited cartoon art directly without creating accounts, providing credit cards, or entering any API keys.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleTestKey()}
                    disabled={isTestingKey}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isTestingKey ? (
                      <>
                        <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                        <span>Checking Status...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Check Connection Status</span>
                      </>
                    )}
                  </button>
                  {testResult && (
                    <div className="mt-2 p-2.5 rounded-lg text-xs font-medium bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                      {testResult.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Model Selection Dropdown: One line model, one line description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Image Model Selection
              </label>

              <div className="space-y-2">
                {activeProviderInfo.models.map((m) => {
                  const isSelected = model === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleModelSelect(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500/80 shadow-sm ring-1 ring-blue-500/40'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Line 1: AI Model Name */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}></span>
                          {m.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              Active Selection
                            </span>
                          )}
                          {m.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0 font-medium">
                              {m.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Line 2: Quality & capability description */}
                      <div className="text-[11px] text-slate-400 leading-snug mt-1 pl-4">
                        {m.qualityDescription}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Image Instructions (Locked with Edit & Reset Icons) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  {isPromptLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>AI Image Instructions</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      isPromptLocked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isPromptLocked ? 'Locked' : 'Editable'}
                  </span>
                </label>

                <div className="flex items-center gap-1.5">
                  {/* Edit / Lock Toggle Icon Button */}
                  <button
                    type="button"
                    onClick={() => setIsPromptLocked(!isPromptLocked)}
                    className={`text-[11px] px-2 py-1 rounded-lg flex items-center gap-1 border transition-all cursor-pointer ${
                      isPromptLocked
                        ? 'text-blue-400 hover:text-blue-300 bg-blue-950/60 border-blue-800/60'
                        : 'text-amber-400 hover:text-amber-300 bg-amber-950/60 border-amber-800/60'
                    }`}
                    title={isPromptLocked ? 'Click to unlock and edit instructions' : 'Click to lock instructions'}
                  >
                    {isPromptLocked ? (
                      <>
                        <Pencil className="w-3 h-3 text-blue-400" />
                        <span>Edit</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Lock</span>
                      </>
                    )}
                  </button>

                  {/* Reset to Default Icon Button */}
                  <button
                    type="button"
                    onClick={handleResetPrompt}
                    className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="Reset AI image instructions to original default"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  readOnly={isPromptLocked}
                  placeholder="Enter system guidance for the AI character generator..."
                  className={`w-full p-3 rounded-xl border text-xs transition-colors leading-relaxed ${
                    isPromptLocked
                      ? 'bg-slate-950/50 border-slate-800 text-slate-400 cursor-not-allowed select-none'
                      : 'bg-slate-950 border-blue-500/80 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                {isPromptLocked && (
                  <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 flex items-center gap-1 pointer-events-none">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Locked to prevent accidental changes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:px-4 sm:py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step by step guide modal */}
      <ApiInstructionsModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        selectedProviderId={provider}
        onSelectProvider={(selectedId) => {
          handleProviderChange(selectedId);
        }}
      />
    </>
  );
};
