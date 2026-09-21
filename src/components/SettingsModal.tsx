import React, { useState } from 'react';
import { RuntimeParams } from '../types';
import { Settings, X, Check, RotateCcw } from 'lucide-react';
import { DEFAULT_RUNTIME_PARAMS } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: RuntimeParams;
  onSave: (params: RuntimeParams) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  params: initialParams,
  onSave,
}) => {
  const [params, setParams] = useState<RuntimeParams>(initialParams);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(params);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl border bg-[#181b25] border-white/10 text-[#dfe2ef] space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#262a34] flex items-center justify-center text-[#4cd7f6]">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#dfe2ef] font-geist">
              Settings & Model Parameters
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[#c7c4d7] mb-1 font-semibold">
              System Instruction
            </label>
            <textarea
              rows={4}
              value={params.systemInstruction}
              onChange={(e) => setParams({ ...params, systemInstruction: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#0f131c] border border-white/10 text-white placeholder:text-[#908fa0] text-xs font-inter leading-relaxed focus:outline-none focus:border-[#4cd7f6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#c7c4d7]">Temperature:</span>
                <span className="text-[#4cd7f6]">{params.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.temperature}
                onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) })}
                className="w-full accent-[#4cd7f6]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#c7c4d7]">Top-P:</span>
                <span className="text-[#4cd7f6]">{params.topP}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={params.topP}
                onChange={(e) => setParams({ ...params, topP: parseFloat(e.target.value) })}
                className="w-full accent-[#4cd7f6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#c7c4d7] mb-1">
              Max Output Tokens
            </label>
            <input
              type="number"
              min="256"
              max="8192"
              step="256"
              value={params.maxOutputTokens}
              onChange={(e) => setParams({ ...params, maxOutputTokens: parseInt(e.target.value, 10) || 4096 })}
              className="w-full px-3 py-2 rounded-xl bg-[#0f131c] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#4cd7f6]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setParams(DEFAULT_RUNTIME_PARAMS)}
              className="flex items-center gap-1.5 text-xs text-[#908fa0] hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#dfe2ef] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-[#8083ff]/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
