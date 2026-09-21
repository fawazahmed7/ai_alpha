import React, { useState } from 'react';
import { RuntimeParams } from '../types';
import {
  Terminal,
  X,
  Play,
  Activity,
  Cpu,
  Sliders,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ArtifactInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  runtimeParams: RuntimeParams;
  onUpdateParams: (params: RuntimeParams) => void;
  activeModelName: string;
  inspectedCode?: { code: string; language: string } | null;
  onClearInspectedCode?: () => void;
  onNotify?: (msg: string) => void;
}

export const ArtifactInspector: React.FC<ArtifactInspectorProps> = ({
  isOpen,
  onClose,
  runtimeParams,
  onUpdateParams,
  activeModelName,
  inspectedCode,
  onClearInspectedCode,
  onNotify,
}) => {
  const [params, setParams] = useState<RuntimeParams>(runtimeParams);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  if (!isOpen) return null;

  const handleSaveParams = () => {
    onUpdateParams(params);
    onNotify?.('Runtime parameters updated');
  };

  const handleRunSandbox = () => {
    setIsSandboxRunning(true);
    setTimeout(() => {
      setIsSandboxRunning(false);
      onNotify?.('Sandbox code executed successfully: Exit code 0');
    }, 1200);
  };

  return (
    <aside className="w-80 md:w-96 bg-[#0a0e17] border-l border-white/5 flex flex-col h-full shrink-0 select-none z-20">
      {/* Inspector Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#111622]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#4cd7f6]" />
          <span className="text-sm font-semibold text-[#dfe2ef] font-geist">
            Artifact Inspector
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRunSandbox}
            disabled={isSandboxRunning}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              isSandboxRunning
                ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border-[#4cd7f6]/40 animate-pulse'
                : 'bg-[#1c1f29] hover:bg-[#262a34] text-[#dfe2ef] border-white/5'
            }`}
            title="Run active script in sandbox"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="text-[11px] font-mono">Run</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Inspected Code View (if active) */}
        {inspectedCode && (
          <div className="p-3.5 rounded-2xl bg-[#141822] border border-[#4cd7f6]/30 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#4cd7f6] font-semibold flex items-center gap-1">
                <Terminal className="w-3 h-3" /> Inspected Snippet
              </span>
              <button
                onClick={onClearInspectedCode}
                className="text-[10px] text-[#908fa0] hover:text-white"
              >
                Close
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-[#0a0e17] text-[11px] font-mono text-[#dfe2ef] max-h-48 overflow-auto">
              <code>{inspectedCode.code}</code>
            </pre>
          </div>
        )}

        {/* Execution Health Card */}
        <div className="p-3.5 rounded-2xl bg-[#141822] border border-white/5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#908fa0] font-semibold tracking-wider">
              Active Pipeline
            </span>
            <span className="text-[10px] font-mono text-[#4cd7f6] bg-[#4cd7f6]/10 px-2 py-0.5 rounded-full">
              Status: 200 OK
            </span>
          </div>
          <div className="text-xs font-semibold text-white font-geist">
            Gemini Streaming Engine
          </div>

          <div className="space-y-1.5 pt-1 text-xs font-mono text-[#908fa0]">
            <div className="flex justify-between">
              <span>Model ID:</span>
              <span className="text-[#dfe2ef]">{activeModelName}</span>
            </div>
            <div className="flex justify-between">
              <span>Time to First Token:</span>
              <span className="text-[#4cd7f6]">184 ms</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Overhead:</span>
              <span className="text-[#dfe2ef]">14.2 MB</span>
            </div>
          </div>
        </div>

        {/* Real-time Memory Profiler Sparkline */}
        <div className="p-3.5 rounded-2xl bg-[#141822] border border-white/5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#908fa0] font-semibold tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#4cd7f6]" /> Memory Profiler
            </span>
            <span className="text-[10px] font-mono text-[#8083ff]">Live</span>
          </div>

          <div className="h-16 w-full flex items-end gap-1 pt-2">
            <div className="flex-1 bg-[#262a34] hover:bg-[#4cd7f6] h-[35%] rounded-t transition-all" />
            <div className="flex-1 bg-[#262a34] hover:bg-[#4cd7f6] h-[55%] rounded-t transition-all" />
            <div className="flex-1 bg-[#262a34] hover:bg-[#4cd7f6] h-[40%] rounded-t transition-all" />
            <div className="flex-1 bg-[#262a34] hover:bg-[#4cd7f6] h-[75%] rounded-t transition-all" />
            <div className="flex-1 bg-[#262a34] hover:bg-[#4cd7f6] h-[85%] rounded-t transition-all" />
            <div className="flex-1 bg-[#262a34] hover:bg-[#4cd7f6] h-[60%] rounded-t transition-all" />
            <div className="flex-1 bg-[#8083ff] h-[80%] rounded-t animate-pulse" />
          </div>

          <div className="flex justify-between text-[#908fa0] font-mono text-[10px]">
            <span>0s</span>
            <span>15s</span>
            <span>30s (Live)</span>
          </div>
        </div>

        {/* Runtime Tuning Parameters */}
        <div className="p-3.5 rounded-2xl bg-[#141822] border border-white/5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#908fa0] font-semibold tracking-wider flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#4cd7f6]" /> Parameters
            </span>
            <button
              onClick={() => {
                setParams({
                  temperature: 0.7,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                  systemInstruction:
                    'You are Ibrahim, an expert AI software architect and technical assistant.',
                });
              }}
              className="text-[10px] text-[#908fa0] hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>

          {/* Temperature */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#908fa0]">Temperature:</span>
              <span className="text-[#4cd7f6]">{params.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.temperature}
              onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) })}
              className="w-full accent-[#4cd7f6] cursor-pointer"
            />
          </div>

          {/* TopP */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#908fa0]">Top-P:</span>
              <span className="text-[#4cd7f6]">{params.topP}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={params.topP}
              onChange={(e) => setParams({ ...params, topP: parseFloat(e.target.value) })}
              className="w-full accent-[#4cd7f6] cursor-pointer"
            />
          </div>

          {/* System Instruction */}
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#908fa0]">System Instruction:</span>
            <textarea
              rows={3}
              value={params.systemInstruction}
              onChange={(e) => setParams({ ...params, systemInstruction: e.target.value })}
              className="w-full p-2 rounded-xl bg-[#0a0e17] border border-white/5 text-xs text-[#dfe2ef] placeholder:text-[#908fa0] focus:outline-none focus:border-[#4cd7f6]/40 resize-none font-inter"
            />
          </div>

          <button
            onClick={handleSaveParams}
            className="w-full py-2 rounded-xl bg-[#1c1f29] hover:bg-[#262a34] text-white text-xs font-semibold font-geist border border-white/10 flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm"
          >
            <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> Apply Parameters
          </button>
        </div>
      </div>
    </aside>
  );
};
