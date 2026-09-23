import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Activity,
  Key,
  Server,
  Play
} from 'lucide-react';
import { PublicProvider } from '../types';
import {
  fetchAdminProviders,
  saveAdminProvider,
  deleteAdminProvider,
  testAdminProvider,
  resetProviderCircuit,
  testFallbackChain,
  fetchProviderHealthOverview
} from '../utils/providerApi';

interface CreatorAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isCreator?: boolean;
}

export const CreatorAdminModal: React.FC<CreatorAdminModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  isCreator
}) => {
  const [activeTab, setActiveTab] = useState<'providers' | 'chains' | 'health'>('providers');
  const [providers, setProviders] = useState<PublicProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit / Add modal state
  const [editingProvider, setEditingProvider] = useState<Partial<PublicProvider> | null>(null);
  const [editApiKey, setEditApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  // Testing states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [chainTesting, setChainTesting] = useState(false);
  const [chainTestResult, setChainTestResult] = useState<any | null>(null);

  // Health overview
  const [healthData, setHealthData] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAdminProviders(userEmail);
      setProviders(list);
      const health = await fetchProviderHealthOverview(userEmail).catch(() => null);
      if (health) setHealthData(health);
    } catch (err: any) {
      setError(err?.message || 'Failed to load provider configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleToggleEnabled = async (provider: PublicProvider) => {
    try {
      const updated = await saveAdminProvider(
        { id: provider.id, enabled: !provider.enabled },
        userEmail
      );
      setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSuccessMsg(`Provider "${provider.displayName}" ${!provider.enabled ? 'enabled' : 'disabled'}.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle provider');
    }
  };

  const handlePriorityShift = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= providers.length) return;

    const current = providers[index];
    const target = providers[targetIndex];

    try {
      await saveAdminProvider({ id: current.id, priority: target.priority }, userEmail);
      await saveAdminProvider({ id: target.id, priority: current.priority }, userEmail);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to reorder priority');
    }
  };

  const handleResetCircuit = async (id: string, name: string) => {
    try {
      const msg = await resetProviderCircuit(id, userEmail);
      setSuccessMsg(msg || `Circuit breaker reset for ${name}`);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to reset circuit');
    }
  };

  const handleTestProvider = async (provider: PublicProvider) => {
    setTestingId(provider.id);
    setTestResult(null);
    try {
      const res = await testAdminProvider(provider.id, userEmail);
      setTestResult({
        id: provider.id,
        message: `${res.message} (${res.latencyMs || 0}ms)`,
        success: res.success
      });
      await loadData();
    } catch (err: any) {
      setTestResult({
        id: provider.id,
        message: err?.message || 'Provider connection probe failed',
        success: false
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    setSaving(true);
    setError(null);
    try {
      await saveAdminProvider(
        {
          ...editingProvider,
          apiKey: editApiKey.trim() || undefined
        },
        userEmail
      );
      setSuccessMsg(`Saved provider "${editingProvider.displayName}".`);
      setEditingProvider(null);
      setEditApiKey('');
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteAdminProvider(id, userEmail);
      setSuccessMsg(`Deleted provider "${name}".`);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete provider');
    }
  };

  const handleRunChainTest = async (tier: 'free' | 'paid') => {
    setChainTesting(true);
    setChainTestResult(null);
    setError(null);
    try {
      const res = await testFallbackChain(tier, userEmail);
      setChainTestResult(res);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Fallback chain test failed');
    } finally {
      setChainTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Creator API & Provider Management
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Creator Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage built-in image providers, secure fallback order, circuit breakers, and daily allowances.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('providers')}
              className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'providers'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Configured Providers ({providers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('chains')}
              className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'chains'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Fallback Chain Visualizer & Testing</span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'health'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>System Health & Circuit Breakers</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs flex items-center space-x-1"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingProvider({
                  displayName: '',
                  providerType: 'google',
                  model: 'gemini-3.1-flash-image',
                  enabled: true,
                  tier: 'both',
                  priority: providers.length + 1,
                  timeoutMs: 45000,
                  maxRetries: 2
                });
                setEditApiKey('');
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Provider</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="m-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab 1: Providers List */}
        {activeTab === 'providers' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 w-16 text-center">Priority</th>
                    <th className="py-3 px-4">Provider / Model</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Tier</th>
                    <th className="py-3 px-3">API Key</th>
                    <th className="py-3 px-3">Circuit</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {providers.map((provider, idx) => {
                    const isClosed = provider.circuitState === 'closed';
                    const isOpen = provider.circuitState === 'open';
                    return (
                      <tr
                        key={provider.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          !provider.enabled ? 'opacity-50 bg-slate-950/20' : ''
                        }`}
                      >
                        {/* Priority Shift */}
                        <td className="py-3 px-2 text-center font-sans">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="font-bold text-amber-400 text-sm">{provider.priority}</span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handlePriorityShift(idx, 'up')}
                                disabled={idx === 0}
                                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                                title="Move up in fallback order"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handlePriorityShift(idx, 'down')}
                                disabled={idx === providers.length - 1}
                                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                                title="Move down in fallback order"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Name & Model */}
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-white text-sm">{provider.displayName}</div>
                          <div className="text-slate-400 text-xs font-mono">{provider.model}</div>
                          {provider.lastLatencyMs ? (
                            <span className="inline-block mt-1 text-[11px] text-emerald-400 font-sans">
                              ⚡ {provider.lastLatencyMs}ms response
                            </span>
                          ) : null}
                        </td>

                        {/* Provider Type */}
                        <td className="py-3 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                            {provider.providerType}
                          </span>
                        </td>

                        {/* Tier */}
                        <td className="py-3 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              provider.tier === 'free'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : provider.tier === 'paid'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {provider.tier === 'both' ? 'Free & Paid' : provider.tier.toUpperCase()}
                          </span>
                        </td>

                        {/* Masked Key */}
                        <td className="py-3 px-3">
                          {provider.providerType === 'pollinations' ? (
                            <span className="text-slate-400 italic font-sans text-xs">No key needed</span>
                          ) : provider.hasApiKey ? (
                            <div className="flex items-center space-x-1 text-slate-300">
                              <Key className="w-3 h-3 text-amber-400" />
                              <span>{provider.maskedApiKey || 'sk-•••••••'}</span>
                            </div>
                          ) : (
                            <span className="text-rose-400 text-xs font-sans">Missing key</span>
                          )}
                        </td>

                        {/* Circuit State */}
                        <td className="py-3 px-3 font-sans">
                          {isClosed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Closed (OK)
                            </span>
                          ) : isOpen ? (
                            <div className="flex items-center space-x-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                Open (Tripped)
                              </span>
                              <button
                                onClick={() => handleResetCircuit(provider.id, provider.displayName)}
                                className="px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600"
                                title="Reset Circuit Breaker"
                              >
                                Reset
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Half-Open
                            </span>
                          )}
                        </td>

                        {/* Enabled / Disabled Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleEnabled(provider)}
                            className={`w-11 h-6 rounded-full transition-colors relative inline-block ${
                              provider.enabled ? 'bg-amber-500' : 'bg-slate-700'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                provider.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-2 font-sans">
                          <button
                            onClick={() => handleTestProvider(provider)}
                            disabled={testingId === provider.id}
                            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 inline-flex items-center space-x-1"
                            title="Run connection probe"
                          >
                            <Play className={`w-3 h-3 ${testingId === provider.id ? 'animate-spin' : ''}`} />
                            <span>Test</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingProvider(provider);
                              setEditApiKey('');
                            }}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 inline-flex"
                            title="Edit provider settings"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(provider.id, provider.displayName)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 inline-flex"
                            title="Delete provider"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Test notification result */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fallback Chain Visualizer */}
        {activeTab === 'chains' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Free Tier Fallback Order */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h3 className="font-semibold text-white text-sm">Free Tier Fallback Chain</h3>
                  </div>
                  <button
                    onClick={() => handleRunChainTest('free')}
                    disabled={chainTesting}
                    className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>{chainTesting ? 'Testing...' : 'Test Free Chain'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Sequential fallback order attempted for Free Tier users (1 generation/day limit enforced).
                </p>
                <div className="space-y-2 font-mono text-xs">
                  {providers
                    .filter((p) => p.enabled && (p.tier === 'free' || p.tier === 'both'))
                    .sort((a, b) => a.priority - b.priority)
                    .map((p, i) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                            {i + 1}
                          </span>
                          <div>
                            <span className="font-sans font-medium text-white">{p.displayName}</span>
                            <span className="text-slate-400 text-[11px] block">{p.model}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans">
                          {p.circuitState === 'closed' ? 'Healthy' : p.circuitState}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Paid Tier Fallback Order */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <h3 className="font-semibold text-white text-sm">Paid Tier Fallback Chain</h3>
                  </div>
                  <button
                    onClick={() => handleRunChainTest('paid')}
                    disabled={chainTesting}
                    className="px-2.5 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded font-medium flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>{chainTesting ? 'Testing...' : 'Test Paid Chain'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Sequential fallback order attempted for Paid Tier users when using creator-managed infrastructure.
                </p>
                <div className="space-y-2 font-mono text-xs">
                  {providers
                    .filter((p) => p.enabled && (p.tier === 'paid' || p.tier === 'both'))
                    .sort((a, b) => a.priority - b.priority)
                    .map((p, i) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                            {i + 1}
                          </span>
                          <div>
                            <span className="font-sans font-medium text-white">{p.displayName}</span>
                            <span className="text-slate-400 text-[11px] block">{p.model}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans">
                          {p.circuitState === 'closed' ? 'Healthy' : p.circuitState}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Chain Test Results Panel */}
            {chainTestResult && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Chain Execution Test Summary</span>
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      chainTestResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {chainTestResult.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-400">Winning Provider: </span>
                    <strong className="text-white">{chainTestResult.winnerProviderId}</strong> ({chainTestResult.modelUsed})
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="text-slate-400">Provider Attempts in Chain:</div>
                    {chainTestResult.attempts?.map((att: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-[11px]"
                      >
                        <span>
                          {idx + 1}. {att.providerId} ({att.model})
                        </span>
                        <span>
                          {att.error ? (
                            <span className="text-rose-400">{att.error}</span>
                          ) : (
                            <span className="text-emerald-400">OK ({att.latencyMs}ms)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Health & Circuit Breakers */}
        {activeTab === 'health' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Total Configured</div>
                <div className="text-2xl font-bold text-white mt-1">{providers.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Active / Enabled</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {providers.filter((p) => p.enabled).length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Circuits Closed (Healthy)</div>
                <div className="text-2xl font-bold text-sky-400 mt-1">
                  {providers.filter((p) => p.circuitState === 'closed').length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Circuits Open (Cooldown)</div>
                <div className="text-2xl font-bold text-rose-400 mt-1">
                  {providers.filter((p) => p.circuitState === 'open').length}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm">Provider Circuit Breaker Diagnostics</h4>
              <div className="space-y-2">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{p.displayName}</div>
                      <div className="text-slate-400 text-[11px]">
                        Failures: {p.failureCount} / 3 &middot; State: {p.circuitState.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {p.circuitState !== 'closed' && (
                        <button
                          onClick={() => handleResetCircuit(p.id, p.displayName)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded text-xs"
                        >
                          Reset Circuit
                        </button>
                      )}
                      <button
                        onClick={() => handleTestProvider(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700"
                      >
                        Ping Probe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Keys are encrypted with AES-256-GCM. Never transmitted to client browsers.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>

      {/* Provider Edit / Add Dialog */}
      {editingProvider && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingProvider.id ? 'Edit Provider' : 'Add New Provider'}
              </h3>
              <button
                onClick={() => setEditingProvider(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editingProvider.displayName || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, displayName: e.target.value })
                  }
                  placeholder="e.g. Google Gemini Pro Image"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Provider Type</label>
                  <select
                    value={editingProvider.providerType || 'google'}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        providerType: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="google">Google Gemini</option>
                    <option value="pollinations">Pollinations AI (Free)</option>
                    <option value="openai">OpenAI (DALL-E)</option>
                    <option value="stability">Stability AI</option>
                    <option value="huggingface">Hugging Face</option>
                    <option value="custom">Custom Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Model Name / Repo</label>
                  <input
                    type="text"
                    required
                    value={editingProvider.model || ''}
                    onChange={(e) =>
                      setEditingProvider({ ...editingProvider, model: e.target.value })
                    }
                    placeholder="e.g. gemini-3.1-flash-image"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>API Key</span>
                  <span className="text-[11px] text-slate-400">
                    {editingProvider.maskedApiKey ? `Current: ${editingProvider.maskedApiKey}` : 'Leave blank if not rotating'}
                  </span>
                </label>
                <input
                  type="password"
                  value={editApiKey}
                  onChange={(e) => setEditApiKey(e.target.value)}
                  placeholder={
                    editingProvider.providerType === 'pollinations'
                      ? 'No key required'
                      : editingProvider.maskedApiKey
                      ? 'Enter new key to rotate, or leave empty'
                      : 'sk-...'
                  }
                  disabled={editingProvider.providerType === 'pollinations'}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Tier</label>
                  <select
                    value={editingProvider.tier || 'both'}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        tier: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="free">Free Tier Only</option>
                    <option value="paid">Paid Tier Only</option>
                    <option value="both">Both Free & Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority Order</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editingProvider.priority ?? 1}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        priority: parseInt(e.target.value, 10) || 1
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Timeout (ms)</label>
                  <input
                    type="number"
                    value={editingProvider.timeoutMs || 45000}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        timeoutMs: parseInt(e.target.value, 10) || 45000
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Retries</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={editingProvider.maxRetries ?? 2}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        maxRetries: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
