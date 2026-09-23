import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['⌘', 'Enter'], label: 'Make Me Cartoon!', desc: 'Trigger AI generation immediately' },
    { keys: ['C'], label: 'Open Crop Tool', desc: 'Center face & adjust framing' },
    { keys: ['R'], label: 'Randomize Seed', desc: 'Pick a new seed for fresh variation' },
    { keys: ['L'], label: 'Lock/Unlock Seed', desc: 'Toggle identity consistency lock' },
    { keys: ['1'], label: 'Split Slider View', desc: 'Interactive before/after comparison' },
    { keys: ['2'], label: 'Side-by-Side View', desc: 'Dual panel synchronized view' },
    { keys: ['3'], label: 'Cartoon Only View', desc: 'Focus purely on generated cartoon' },
    { keys: ['Esc'], label: 'Close Dialogs', desc: 'Dismiss active modals & menus' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-cartoon">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Quick productivity hotkeys</p>
            </div>
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

        <div className="p-4 sm:p-6 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200">{sc.label}</div>
                <div className="text-[11px] text-slate-400">{sc.desc}</div>
              </div>
              <div className="flex items-center gap-1">
                {sc.keys.map((k, ki) => (
                  <kbd
                    key={ki}
                    className="min-w-[24px] px-2 py-1 text-center text-xs font-mono font-medium rounded-md bg-slate-800 border border-slate-700 text-slate-300 shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
