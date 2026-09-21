import React, { useState, useRef, useEffect } from 'react';
import { Attachment } from '../types';
import {
  ArrowUp,
  Square,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  X,
  Code,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { startVoiceRecognition } from '../utils/speech';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onStopGeneration?: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  onSelectSuggestedPrompt?: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  { label: 'Add zod schema validator', icon: Code, prompt: 'How do I combine Gemini structured JSON schema with a Zod validator in TypeScript?' },
  { label: 'Benchmark streaming latency', icon: Zap, prompt: 'Write a benchmark script to measure Time-To-First-Token (TTFT) in streaming API routes.' },
  { label: 'Sanitize Markdown XSS', icon: ShieldCheck, prompt: 'Show me best practices to sanitize rendered AI markdown from XSS in React.' },
  { label: 'Next.js App Router patterns', icon: Sparkles, prompt: 'Compare Next.js 14 App Router server actions vs API routes for LLM endpoints.' },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  disabled = false,
  onSelectSuggestedPrompt,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const voiceSessionRef = useRef<{ stop: () => void } | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        const newAttachment: Attachment = {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64String,
          mimeType: file.type || (isImage ? 'image/png' : 'text/plain'),
          isImage,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Voice dictation toggle
  const toggleVoice = () => {
    if (isRecording) {
      voiceSessionRef.current?.stop();
      setIsRecording(false);
    } else {
      const session = startVoiceRecognition({
        onResult: (transcript) => {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: (err) => {
          console.warn('Voice recognition error:', err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        },
      });

      if (session) {
        voiceSessionRef.current = session;
        setIsRecording(true);
      }
    }
  };

  // Estimated token count (approx 4 chars per token)
  const tokenEstimate = Math.ceil((text.length + attachments.reduce((acc, a) => acc + a.size / 4, 0)) / 4);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 pointer-events-auto">
      {/* Suggested Prompt Pills (horizontal micro-carousel) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SUGGESTED_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                if (onSelectSuggestedPrompt) {
                  onSelectSuggestedPrompt(item.prompt);
                } else {
                  setText(item.prompt);
                }
              }}
              className="px-3 py-1.5 rounded-full bg-[#1c1f29]/90 hover:bg-[#262a34] backdrop-blur-md text-[#dfe2ef] text-xs shrink-0 flex items-center gap-1.5 border border-white/5 transition-all shadow-sm active:scale-95 group font-inter"
            >
              <Icon className="w-3.5 h-3.5 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e, false)}
        multiple
        className="hidden"
        accept=".txt,.md,.json,.ts,.tsx,.js,.jsx,.py,.html,.css,.sql"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileUpload(e, true)}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Compound Capsule Panel */}
      <div className="rounded-2xl bg-[#181b25]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-2.5 md:p-3 flex flex-col gap-2 transition-all focus-within:border-[#4cd7f6]/40 focus-within:ring-1 focus-within:ring-[#4cd7f6]/20">
        {/* Attachment Badges */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 pt-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-xl bg-[#0a0e17] border border-white/10 text-xs text-[#dfe2ef]"
              >
                {att.isImage ? (
                  <ImageIcon className="w-3.5 h-3.5 text-[#4cd7f6]" />
                ) : (
                  <Paperclip className="w-3.5 h-3.5 text-[#8083ff]" />
                )}
                <span className="max-w-[120px] truncate">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini anything... (Press Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={disabled}
          className="w-full bg-transparent resize-none text-[15px] leading-relaxed text-[#dfe2ef] placeholder:text-[#908fa0] px-2 pt-1 focus:outline-none max-h-[180px] font-inter"
        />

        {/* Bottom Dock Action Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Utility Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-white/5 text-[#908fa0] hover:text-[#dfe2ef] transition-colors"
              title="Attach Code File or Document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-white/5 text-[#908fa0] hover:text-[#dfe2ef] transition-colors"
              title="Upload Image for Multimodal Vision"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              onClick={toggleVoice}
              className={`p-2 rounded-xl transition-colors ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'hover:bg-white/5 text-[#908fa0] hover:text-[#4cd7f6]'
              }`}
              title={isRecording ? 'Stop Voice Recording' : 'Voice Dictation'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Dispatch & Meta Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-[#908fa0] bg-[#0a0e17] px-2 py-1 rounded-md border border-white/5">
              <span>{tokenEstimate} tokens</span>
            </div>

            {isGenerating ? (
              <button
                onClick={onStopGeneration}
                className="h-9 md:h-10 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-red-500/10"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!text.trim() && attachments.length === 0}
                className="h-9 md:h-10 px-4 md:px-5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] text-white font-semibold text-xs md:text-sm flex items-center gap-1.5 shadow-lg shadow-[#8083ff]/25 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all font-geist"
              >
                <span>Send</span>
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Micro Status Bar */}
      <div className="flex items-center justify-between px-2 text-[11px] text-[#908fa0]">
        <span className="truncate max-w-[280px] sm:max-w-none">
          Gemini may display inaccurate info, so double-check its responses.
        </span>
        <span className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>LocalStorage Synced</span>
        </span>
      </div>
    </div>
  );
};
