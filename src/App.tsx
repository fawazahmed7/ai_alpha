import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, ModelOption, RuntimeParams, ThemeMode, ToastItem, Attachment } from './types';
import {
  loadConversations,
  saveConversations,
  createNewConversation,
  updateConversation,
  deleteConversation,
  clearAllConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadRuntimeParams,
  saveRuntimeParams,
  loadTheme,
  saveTheme,
  getStorageUsage,
  DEFAULT_RUNTIME_PARAMS,
} from './utils/storage';
import { ChatHeader } from './components/ChatHeader';
import { ChatSidebar } from './components/ChatSidebar';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { ArtifactInspector } from './components/ArtifactInspector';
import { EmptyState } from './components/EmptyState';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { RenameModal } from './components/RenameModal';
import { SettingsModal } from './components/SettingsModal';
import { ArrowDown } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string>(() => loadActiveConversationId());
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [runtimeParams, setRuntimeParams] = useState<RuntimeParams>(() => loadRuntimeParams());
  const [storageUsage, setStorageUsage] = useState(() => getStorageUsage());

  // 2. Generation & Streaming State
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // 3. UI Panes & Drawer State
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectedCode, setInspectedCode] = useState<{ code: string; language: string } | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // 4. Modals & Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [renameModal, setRenameModal] = useState<{
    isOpen: boolean;
    conversationId: string;
    currentTitle: string;
  }>({
    isOpen: false,
    conversationId: '',
    currentTitle: '',
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 5. Models State
  const [models, setModels] = useState<ModelOption[]>([
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      badge: 'Default • Fast',
      description: 'Next-gen multimodal workhorse model with low latency and high quality.',
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash-Lite',
      badge: 'Speed',
      description: 'Optimized for high-throughput, real-time responses and lightweight tasks.',
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro',
      badge: 'Reasoning',
      description: 'Advanced reasoning, STEM, complex coding analysis, and deep thought.',
      contextWindow: '2M tokens',
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync theme class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    saveTheme(theme);
  }, [theme]);

  // Fetch models from API on mount
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
        }
      })
      .catch(() => {});
  }, []);

  // Update storage meter on conversation change
  useEffect(() => {
    setStorageUsage(getStorageUsage());
  }, [conversations]);

  // Toast Helper
  const showToast = useCallback((title: string, description?: string, type?: 'success' | 'info' | 'error' | 'warning') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Active Conversation Helper
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0] || null;

  // Selected Model for active conversation
  const selectedModel = activeConversation?.model || 'gemini-3.8-flash';

  const handleSelectModel = (modelId: string) => {
    if (!activeConversation) return;
    const updated = updateConversation(activeConversation.id, { model: modelId });
    setConversations(updated);
    showToast('Model switched', `Active session updated to ${modelId}`, 'info');
  };

  // Scroll to Bottom Helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [activeId]);

  // Track scroll position to show "Scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setIsScrolledUp(isUp);
  };

  // Global Keyboard Shortcuts (⌘N / Ctrl+N for New Chat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations]);

  // CRUD Operations
  const handleNewChat = () => {
    const newConv = createNewConversation('New Chat', selectedModel);
    setConversations(loadConversations());
    setActiveId(newConv.id);
    showToast('New Chat Created', 'Started a fresh session with clean context');
    setTimeout(() => scrollToBottom(false), 50);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    saveActiveConversationId(id);
  };

  const handleOpenRename = (id: string, currentTitle: string) => {
    setRenameModal({
      isOpen: true,
      conversationId: id,
      currentTitle,
    });
  };

  const handleSaveRename = (newTitle: string) => {
    if (!renameModal.conversationId) return;
    const updated = updateConversation(renameModal.conversationId, { title: newTitle });
    setConversations(updated);
    showToast('Conversation Renamed', `Session title set to "${newTitle}"`);
  };

  const handleTogglePin = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    const updated = updateConversation(id, { pinned: !conv.pinned });
    setConversations(updated);
    showToast(conv.pinned ? 'Unpinned Thread' : 'Pinned Thread to Top');
  };

  const handleDeleteConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete this conversation?',
      description: `Are you sure you want to delete "${conv?.title || 'this session'}"? This action cannot be undone.`,
      confirmLabel: 'Delete Session',
      isDestructive: true,
      onConfirm: () => {
        const updated = deleteConversation(id);
        setConversations(updated);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (id === activeId) {
          if (updated.length > 0) {
            setActiveId(updated[0].id);
            saveActiveConversationId(updated[0].id);
          } else {
            handleNewChat();
          }
        }
        showToast('Session Deleted', 'The conversation was removed from local storage');
      },
    });
  };

  const handleClearThread = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Clear this session messages?',
      description: `This will remove all messages from "${activeConversation.title}". The conversation container will remain.`,
      confirmLabel: 'Clear Messages',
      isDestructive: true,
      onConfirm: () => {
        const updated = updateConversation(activeConversation.id, { messages: [] });
        setConversations(updated);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Messages Cleared', 'Conversation history was reset for this thread');
      },
    });
  };

  const handleClearAllConversations = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear all conversation history?',
      description: 'This will permanently purge all threads and cached messages from your local browser storage. This cannot be undone.',
      confirmLabel: 'Purge Everything',
      isDestructive: true,
      onConfirm: () => {
        clearAllConversations();
        const fresh = createNewConversation('New Chat', 'gemini-3.8-flash');
        setConversations([fresh]);
        setActiveId(fresh.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('All Sessions Cleared', 'Storage LocalSync reset to pristine initial state', 'warning');
      },
    });
  };

  // Message Sending & Real-time SSE Streaming
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (!text.trim() && attachments.length === 0) return;
    if (!activeConversation) return;

    const userMessage: Message = {
      id: 'msg-u-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Auto-title conversation on first message if titled "New Chat"
    const isFirstMessage = activeConversation.messages.length === 0;
    const newTitle = isFirstMessage && text.trim() ? text.trim().slice(0, 42) : activeConversation.title;

    const currentMessages = [...activeConversation.messages, userMessage];
    const updatedConversations = updateConversation(activeConversation.id, {
      title: newTitle,
      messages: currentMessages,
    });
    setConversations(updatedConversations);

    // Scroll to bottom immediately
    setTimeout(() => scrollToBottom(true), 50);

    // Start generation
    setIsGenerating(true);
    setStreamingText('');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
            images: m.attachments?.filter((a) => a.isImage).map((a) => ({
              data: a.data,
              mimeType: a.mimeType,
            })),
          })),
          model: activeConversation.model || 'gemini-3.8-flash',
          systemInstruction: runtimeParams.systemInstruction,
          temperature: runtimeParams.temperature,
          topP: runtimeParams.topP,
          maxOutputTokens: runtimeParams.maxOutputTokens,
        }),
        signal: abortController.signal,
      });

      let fullAssistantText = '';

      if (!response.ok) {
        let errorMsg = `Server error ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {}

        if (response.status === 404) {
          // Check if VITE_GEMINI_API_KEY is provided for client fallback
          const clientKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
          if (clientKey) {
            try {
              const geminiModel = activeConversation.model || 'gemini-2.5-flash';
              const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${clientKey}`;
              const restContents = currentMessages.map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content || '' }],
              }));

              const directRes = await fetch(directUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: restContents,
                  generationConfig: {
                    temperature: runtimeParams.temperature,
                    topP: runtimeParams.topP,
                    maxOutputTokens: runtimeParams.maxOutputTokens,
                  },
                }),
                signal: abortController.signal,
              });

              if (directRes.ok && directRes.body) {
                const reader = directRes.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                      try {
                        const parsed = JSON.parse(trimmed.replace(/^data:\s*/, ''));
                        const candidateText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (candidateText) {
                          fullAssistantText += candidateText;
                          setStreamingText(fullAssistantText);
                          scrollToBottom(false);
                        }
                      } catch {}
                    }
                  }
                }
              } else {
                throw new Error('Direct API fallback failed.');
              }
            } catch (fbErr: any) {
              throw new Error(
                'Server error 404: /api/chat endpoint not found. On Vercel, ensure you deploy with the /api serverless functions and add GEMINI_API_KEY under Vercel Project Settings > Environment Variables.'
              );
            }
          } else {
            errorMsg =
              'Server error 404: /api/chat route not found on this host. If you deployed to Vercel, ensure your deployment includes the newly added /api serverless functions and that GEMINI_API_KEY is added under Vercel Settings > Environment Variables.';
            throw new Error(errorMsg);
          }
        } else {
          throw new Error(errorMsg);
        }
      } else {
        // Normal server response handling
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/event-stream') && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.replace(/^data:\s*/, '');
                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                  if (parsed.text) {
                    fullAssistantText += parsed.text;
                    setStreamingText(fullAssistantText);
                    scrollToBottom(false);
                  }
                } catch (e: any) {
                  if (e.message && e.message !== 'Unexpected end of JSON input') {
                    throw e;
                  }
                }
              }
            }
          }
        } else {
          const data = await response.json();
          fullAssistantText = data.text || data.content || '';
        }
      }

      const elapsedSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));

      // Append assistant message
      const assistantMessage: Message = {
        id: 'msg-a-' + Date.now(),
        role: 'assistant',
        content: fullAssistantText || 'No response generated.',
        timestamp: Date.now(),
        thought: `Synthesized with ${activeConversation.model || 'Gemini 3.8'} utilizing server-side streaming and local token rehydration.`,
        thoughtDuration: elapsedSeconds,
        tokens: {
          prompt: Math.ceil((text.length + attachments.reduce((acc, a) => acc + a.size / 4, 0)) / 4),
          completion: Math.ceil(fullAssistantText.length / 4),
        },
      };

      const finalMessages = [...currentMessages, assistantMessage];
      const finalized = updateConversation(activeConversation.id, { messages: finalMessages });
      setConversations(finalized);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('Generation Stopped', 'Output generation was interrupted by user', 'info');
      } else {
        console.error('Chat error:', err);
        const errorMessage: Message = {
          id: 'msg-err-' + Date.now(),
          role: 'assistant',
          content: err.message || 'An unexpected error occurred while communicating with Gemini API.',
          timestamp: Date.now(),
          isError: true,
        };
        const finalMessages = [...currentMessages, errorMessage];
        const finalized = updateConversation(activeConversation.id, { messages: finalMessages });
        setConversations(finalized);
        showToast('Request Failed', err.message || 'API generation failed', 'error');
      }
    } finally {
      setIsGenerating(false);
      setStreamingText('');
      abortControllerRef.current = null;
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const msgs = [...activeConversation.messages];
    // If the last message is from assistant, pop it and resend last user message
    if (msgs[msgs.length - 1]?.role === 'assistant') {
      msgs.pop();
    }
    const lastUserMsg = msgs[msgs.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      const remaining = msgs.slice(0, -1);
      updateConversation(activeConversation.id, { messages: remaining });
      setConversations(loadConversations());
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
    }
  };

  const handleRateMessage = (messageId: string, rating: 'up' | 'down') => {
    if (!activeConversation) return;
    const updatedMessages = activeConversation.messages.map((m) => {
      if (m.id === messageId) {
        const newRating = m.rating === rating ? null : rating;
        return { ...m, rating: newRating };
      }
      return m;
    });
    const updated = updateConversation(activeConversation.id, { messages: updatedMessages });
    setConversations(updated);
    showToast(rating === 'up' ? 'Feedback received: Helpful' : 'Feedback received: Unhelpful', undefined, 'info');
  };

  const handleShareClick = () => {
    if (!activeConversation) return;
    const transcript = activeConversation.messages
      .map((m) => `[${m.role.toUpperCase()}] (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.content}\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(transcript).then(
      () => {
        showToast('Transcript Copied', 'Full conversation transcript copied to clipboard');
      },
      () => {
        showToast('Share failed', 'Could not copy to clipboard', 'error');
      }
    );
  };

  // Approximate token count in active session
  const activeTokenCount = (activeConversation?.messages || []).reduce((acc, m) => {
    return acc + (m.tokens?.prompt || 0) + (m.tokens?.completion || 0) + Math.ceil(m.content.length / 4);
  }, 0);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f131c] text-[#dfe2ef] font-inter antialiased select-none">
      {/* 1. Left Navigation Drawer / Thread Archive */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleOpenRename}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        onClearAll={handleClearAllConversations}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpenMobile={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
        storageUsage={storageUsage}
      />

      {/* 2. Main Conversational Stage */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#0f131c]">
        {/* Sticky Action Bar */}
        <ChatHeader
          threadTitle={activeConversation?.title || 'New Chat'}
          onRenameClick={() => activeConversation && handleOpenRename(activeConversation.id, activeConversation.title)}
          onClearThreadClick={handleClearThread}
          onToggleSidebar={() => setSidebarOpenMobile(true)}
          onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
          inspectorOpen={inspectorOpen}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          models={models}
          tokenCount={activeTokenCount}
          onShareClick={handleShareClick}
        />

        {/* Chat Messages Stream Area */}
        <main
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full pb-48 scroll-smooth select-text"
        >
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={(p) => handleSendMessage(p)}
              temperature={runtimeParams.temperature}
            />
          ) : (
            <>
              {activeConversation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={msg.role === 'assistant' ? handleRegenerate : undefined}
                  onCopySuccess={(notice) => showToast(notice)}
                  onRate={handleRateMessage}
                  onOpenInspectorCode={(code, lang) => {
                    setInspectedCode({ code, language: lang });
                    setInspectorOpen(true);
                  }}
                />
              ))}

              {isGenerating && (
                <TypingIndicator
                  streamingText={streamingText}
                  speed="Streaming 42 tk/s"
                />
              )}
            </>
          )}
        </main>

        {/* Floating Scroll-to-Bottom Button */}
        {isScrolledUp && (
          <button
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-36 right-8 z-30 p-2.5 rounded-full bg-[#181b25] hover:bg-[#262a34] text-[#4cd7f6] border border-white/10 shadow-2xl transition-all duration-200 animate-in fade-in active:scale-95"
            title="Scroll to latest messages"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Floating Compound Input Dock (Pinned to bottom) */}
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-6 pointer-events-none z-20 flex justify-center">
          <ChatInput
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isGenerating={isGenerating}
            onSelectSuggestedPrompt={(p) => handleSendMessage(p)}
          />
        </div>
      </div>

      {/* 3. Right Context / Artifact Inspector Pane */}
      <ArtifactInspector
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        runtimeParams={runtimeParams}
        onUpdateParams={(p) => {
          setRuntimeParams(p);
          saveRuntimeParams(p);
        }}
        activeModelName={selectedModel}
        inspectedCode={inspectedCode}
        onClearInspectedCode={() => setInspectedCode(null)}
        onNotify={(msg) => showToast(msg)}
      />

      {/* 4. Global Modals & Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <RenameModal
        isOpen={renameModal.isOpen}
        currentTitle={renameModal.currentTitle}
        onSave={handleSaveRename}
        onClose={() => setRenameModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        params={runtimeParams}
        onSave={(newParams) => {
          setRuntimeParams(newParams);
          saveRuntimeParams(newParams);
          showToast('Settings Saved', 'Model parameters updated successfully');
        }}
      />
    </div>
  );
}
