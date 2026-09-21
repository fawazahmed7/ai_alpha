import React, { useState, useRef, useEffect } from 'react';
import { ModelOption } from '../types';
import {
  Menu,
  Edit2,
  Share2,
  RotateCcw,
  Sidebar,
  ChevronDown,
  Database,
  Check,
  Sparkles,
} from 'lucide-react';

interface ChatHeaderProps {
  threadTitle: string;
  onRenameClick: () => void;
  onClearThreadClick: () => void;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  inspectorOpen: boolean;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  models: ModelOption[];
  tokenCount: number;
  onShareClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  threadTitle,
  onRenameClick,
  onClearThreadClick,
  onToggleSidebar,
  onToggleInspector,
  inspectorOpen,
  selectedModel,
  onSelectModel,
  models,
  tokenCount,
  onShareClick,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between bg-[#0f131c]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 shrink-0">
      {/* Left: Hamburger & Title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-xl text-[#908fa0] hover:text-[#dfe2ef] hover:bg-white/5 xl:hidden transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1
            onClick={onRenameClick}
            className="text-sm md:text-base font-semibold text-[#dfe2ef] truncate max-w-[180px] sm:max-w-xs md:max-w-md font-geist cursor-pointer hover:text-white transition-colors"
            title="Click to rename session"
          >
            {threadTitle}
          </h1>

          <button
            onClick={onRenameClick}
            className="text-[#908fa0] hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors shrink-0"
            title="Rename session"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <span className="hidden sm:inline-flex text-[11px] font-mono text-[#908fa0] bg-[#262a34] px-2 py-0.5 rounded-full border border-white/5">
            Active
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#262a34] hover:bg-[#31353f] border border-white/5 text-[#dfe2ef] transition-all text-xs font-semibold font-geist shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-none">{activeModel?.name || 'Gemini 3.8 Flash'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#908fa0]" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#181b25] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-mono text-[#908fa0] border-b border-white/5">
                Select Model
              </div>
              <div className="space-y-1 mt-1">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex flex-col gap-0.5 transition-colors ${
                      m.id === selectedModel
                        ? 'bg-[#262a34] text-white border border-[#4cd7f6]/30'
                        : 'hover:bg-white/5 text-[#dfe2ef]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold font-geist">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#4cd7f6]" />
                        {m.name}
                      </span>
                      {m.id === selectedModel && <Check className="w-3.5 h-3.5 text-[#4cd7f6]" />}
                    </div>
                    <span className="text-[11px] text-[#908fa0] line-clamp-1">{m.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Token Context Meter */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs text-[#c7c4d7] bg-[#0a0e17] px-2.5 py-1.5 rounded-xl border border-white/5">
          <Database className="w-3.5 h-3.5 text-[#4cd7f6]" />
          <span>{tokenCount.toLocaleString()} / 128k ctx</span>
        </div>

        {/* Share Session */}
        <button
          onClick={onShareClick}
          className="p-2 rounded-xl bg-[#262a34] hover:bg-[#31353f] text-[#908fa0] hover:text-[#dfe2ef] transition-colors border border-white/5"
          title="Share / Export Session"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Clear Thread */}
        <button
          onClick={onClearThreadClick}
          className="p-2 rounded-xl bg-[#262a34] hover:bg-[#31353f] text-[#908fa0] hover:text-red-400 transition-colors border border-white/5"
          title="Purge Messages"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Toggle Inspector Pane */}
        <button
          onClick={onToggleInspector}
          className={`p-2 rounded-xl border transition-colors ${
            inspectorOpen
              ? 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30'
              : 'bg-[#262a34] hover:bg-[#31353f] text-[#908fa0] hover:text-[#dfe2ef] border-white/5'
          }`}
          title="Toggle Artifact Inspector"
        >
          <Sidebar className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
