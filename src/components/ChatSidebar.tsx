import React, { useState, useMemo } from 'react';
import { Conversation, ThemeMode } from '../types';
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Pin,
  PinOff,
  Cloud,
  Moon,
  Sun,
  Settings,
  Trash,
  X,
  Radio,
} from 'lucide-react';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, currentTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onClearAll: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  storageUsage: { usedBytes: number; usedFormatted: string; percent: number };
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onTogglePin,
  onClearAll,
  theme,
  onToggleTheme,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
  storageUsage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPinned, setOnlyPinned] = useState(false);

  // Group conversations by date and pin status
  const { pinned, today, yesterday, previous7Days, older } = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const filtered = conversations.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
      if (onlyPinned && !c.pinned) return false;
      return true;
    });

    const pinnedList: Conversation[] = [];
    const todayList: Conversation[] = [];
    const yesterdayList: Conversation[] = [];
    const prev7List: Conversation[] = [];
    const olderList: Conversation[] = [];

    filtered.forEach((conv) => {
      if (conv.pinned) {
        pinnedList.push(conv);
        return;
      }
      const age = now - (conv.updatedAt || conv.createdAt);
      if (age < oneDay) {
        todayList.push(conv);
      } else if (age < 2 * oneDay) {
        yesterdayList.push(conv);
      } else if (age < 7 * oneDay) {
        prev7List.push(conv);
      } else {
        olderList.push(conv);
      }
    });

    return {
      pinned: pinnedList,
      today: todayList,
      yesterday: yesterdayList,
      previous7Days: prev7List,
      older: olderList,
    };
  }, [conversations, searchQuery, onlyPinned]);

  const renderGroup = (label: string, items: Conversation[], countLabel?: string) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-1 my-3">
        <div className="px-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#908fa0]">
          <span className="font-semibold text-[#4cd7f6]">{label}</span>
          <span>{countLabel || `${items.length} ${items.length === 1 ? 'session' : 'sessions'}`}</span>
        </div>

        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeId;
            const lastMsg = conv.messages[conv.messages.length - 1]?.content || 'Empty conversation';

            return (
              <div
                key={conv.id}
                className={`group relative rounded-xl transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'bg-[#262a34] shadow-lg border-l-2 border-[#4cd7f6]'
                    : 'hover:bg-[#181b25] text-[#908fa0] hover:text-[#dfe2ef]'
                }`}
              >
                <div
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  className="p-2.5 px-3 flex flex-col gap-0.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#4cd7f6]' : 'text-[#908fa0]'}`} />
                      <span className={`text-xs font-medium truncate font-geist ${isActive ? 'text-white' : 'text-[#dfe2ef]'}`}>
                        {conv.title}
                      </span>
                    </div>
                    {conv.pinned && <Pin className="w-3 h-3 text-[#4cd7f6] shrink-0" />}
                  </div>

                  <p className="text-[11px] text-[#908fa0] line-clamp-1 pl-5.5">
                    {lastMsg}
                  </p>
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-[#181b25] px-1 py-0.5 rounded-lg border border-white/10 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameConversation(conv.id, conv.title);
                    }}
                    className="p-1 text-[#908fa0] hover:text-white transition-colors"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(conv.id);
                    }}
                    className="p-1 text-[#908fa0] hover:text-[#4cd7f6] transition-colors"
                    title={conv.pinned ? 'Unpin' : 'Pin to top'}
                  >
                    {conv.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="p-1 text-[#908fa0] hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed xl:static top-0 left-0 h-full w-72 md:w-80 bg-[#0a0e17] border-r border-white/5 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Brand Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#4cd7f6] flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight font-geist flex items-center gap-1.5">
                  Ibrahim
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                </span>
                <span className="text-[10px] text-[#908fa0] font-mono">Cognitive Assistant</span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 xl:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row: New Chat & Search */}
          <div className="p-3 pb-2 space-y-2">
            <button
              onClick={() => {
                onNewChat();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#1c1f29] hover:bg-[#262a34] text-white border border-white/10 transition-all shadow-md active:scale-98 group"
            >
              <span className="flex items-center gap-2 text-xs font-semibold font-geist">
                <Plus className="w-4 h-4 text-[#4cd7f6] group-hover:rotate-90 transition-transform duration-200" />
                New Chat
              </span>
              <span className="font-mono text-[10px] text-[#908fa0] bg-[#0f131c] px-1.5 py-0.5 rounded border border-white/5">
                ⌘N
              </span>
            </button>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-[#908fa0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads..."
                className="w-full bg-[#141822] text-[#dfe2ef] placeholder:text-[#908fa0] text-xs pl-8 pr-7 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-[#4cd7f6]/40 font-inter transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-[#908fa0] hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar (Pinned toggle) */}
          <div className="px-3 pb-1 flex items-center justify-between text-[11px] text-[#908fa0]">
            <span className="font-mono uppercase text-[10px] tracking-wider">Conversations</span>
            <button
              onClick={() => setOnlyPinned(!onlyPinned)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-colors ${
                onlyPinned ? 'bg-[#4cd7f6]/10 text-[#4cd7f6]' : 'hover:text-[#dfe2ef]'
              }`}
            >
              <Pin className="w-3 h-3" />
              <span>Pinned</span>
            </button>
          </div>

          {/* Scrollable Thread List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#908fa0]">
                No conversations yet. Start a new chat!
              </div>
            ) : (
              <>
                {renderGroup('Pinned', pinned)}
                {renderGroup('Today', today)}
                {renderGroup('Yesterday', yesterday)}
                {renderGroup('Previous 7 Days', previous7Days)}
                {renderGroup('Older', older)}
              </>
            )}
          </div>

          {/* Bottom Telemetry & Sync State */}
          <div className="p-3 bg-[#111622] border-t border-white/5 space-y-3">
            {/* Storage Quota Usage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#908fa0]">
                  <Cloud className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span>Storage LocalSync</span>
                </div>
                <span className="font-mono text-[10px] font-semibold text-[#dfe2ef]">
                  {storageUsage.usedFormatted}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1c1f29] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] rounded-full transition-all duration-300"
                  style={{ width: `${storageUsage.percent}%` }}
                />
              </div>
            </div>

            {/* Connection Status & Clear All */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#908fa0] text-[10px]">Gemini 3.8 Connected</span>
              </div>

              <button
                onClick={onClearAll}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                title="Clear all stored conversations"
              >
                <Trash className="w-3 h-3" />
                <span>Clear all</span>
              </button>
            </div>

            {/* Theme Toggle & User Info */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 text-xs transition-colors"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-400" />}
                <span className="text-[11px] capitalize">{theme} mode</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 text-xs transition-colors"
                title="Model & Prompt Parameters"
              >
                <Settings className="w-4 h-4" />
                <span className="text-[11px]">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
