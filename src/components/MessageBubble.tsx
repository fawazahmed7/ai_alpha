import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speech';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onCopySuccess?: (msg: string) => void;
  onRate?: (messageId: string, rating: 'up' | 'down') => void;
  onOpenInspectorCode?: (code: string, lang: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRegenerate,
  onCopySuccess,
  onRate,
  onOpenInspectorCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);
  const [showThought, setShowThought] = useState(false);

  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopySuccess?.('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleToggleSpeech = () => {
    if (isSpeakingThis) {
      stopSpeaking();
      setIsSpeakingThis(false);
    } else {
      stopSpeaking();
      const success = speakText(
        message.content,
        () => setIsSpeakingThis(false),
        () => setIsSpeakingThis(false)
      );
      if (success) setIsSpeakingThis(true);
    }
  };

  // Custom code renderer for ReactMarkdown
  const markdownComponents = {
    // Un-nest <pre> so <CodeBlock> root <div> does not sit directly inside a <pre>
    pre({ children }: any) {
      return <>{children}</>;
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      // In react-markdown v9+, the `inline` prop is not provided directly.
      // An element is inline if there is no language class specified AND the content contains no newline.
      const isInline = inline ?? (!match && !String(children).includes('\n'));

      if (isInline) {
        return (
          <code
            className="font-mono text-[12px] text-[#4cd7f6] bg-[#0a0e17] px-1.5 py-0.5 rounded border border-white/10"
            {...props}
          >
            {children}
          </code>
        );
      }

      // Check for filename comment in first line, e.g. // app/api/chat/route.ts
      let detectedFilename: string | undefined;
      let cleanCode = codeString;
      const firstLine = codeString.split('\n')[0];
      if (firstLine.startsWith('//') || firstLine.startsWith('#')) {
        const potentialPath = firstLine.replace(/^(\/\/|#)\s*/, '').trim();
        if (potentialPath.includes('.') || potentialPath.includes('/')) {
          detectedFilename = potentialPath;
        }
      }

      return (
        <CodeBlock
          code={cleanCode}
          language={match ? match[1] : undefined}
          filename={detectedFilename}
          onOpenSandbox={
            onOpenInspectorCode
              ? () => onOpenInspectorCode(cleanCode, match ? match[1] : 'typescript')
              : undefined
          }
          onCopySuccess={() => onCopySuccess?.('Code snippet copied to clipboard')}
        />
      );
    },
  };

  if (isUser) {
    return (
      <div className="flex items-start gap-3 md:gap-4 justify-end group my-4">
        <div className="flex flex-col items-end max-w-2xl min-w-0">
          <div className="flex items-center gap-1.5 mb-1 text-xs text-[#908fa0]">
            <span className="font-medium text-[#dfe2ef]">You</span>
            <span>•</span>
            <span>{formattedTime}</span>
          </div>

          {/* User Attachments (if any) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-[#1c1f29] border border-white/10 text-xs text-[#dfe2ef]"
                >
                  {att.isImage ? (
                    <ImageIcon className="w-4 h-4 text-[#4cd7f6]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#8083ff]" />
                  )}
                  <span className="max-w-[150px] truncate">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-2xl rounded-tr-xs bg-[#262a34] text-[#dfe2ef] shadow-md border border-white/5 break-words">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>

          <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-xs text-[#908fa0] hover:text-[#dfe2ef] flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#4cd7f6] flex items-center justify-center shrink-0 shadow-sm mt-1 text-white font-semibold">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant turn
  return (
    <div className="flex items-start gap-3 md:gap-4 group my-5">
      {/* Gemini Sparkle Badge with Glowing Ambient Ring */}
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#262a34] flex items-center justify-center shrink-0 mt-1 relative border border-white/10 shadow-lg">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] rounded-xl blur-[3px] opacity-30 group-hover:opacity-75 transition duration-300 pointer-events-none" />
        <Sparkles className="w-4 h-4 text-[#4cd7f6] relative z-10" />
      </div>

      <div className="flex flex-col flex-1 min-w-0 max-w-3xl">
        {/* Meta / Reasoning Pill */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-semibold text-[#dfe2ef] font-geist">Gemini</span>
          <span className="text-xs text-[#908fa0]">• {formattedTime}</span>

          {message.thought && (
            <button
              onClick={() => setShowThought(!showThought)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#31353f] hover:bg-[#353943] text-[#ddb7ff] border border-[#ddb7ff]/20 text-xs font-medium transition-all"
            >
              <Brain className="w-3 h-3" />
              <span>
                Thought {message.thoughtDuration ? `for ${message.thoughtDuration}s` : 'process'}
              </span>
              {showThought ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Expandable Reasoning Box */}
        {message.thought && showThought && (
          <div className="mb-3 p-3.5 rounded-xl bg-[#181b25] border border-[#ddb7ff]/20 text-xs text-[#c7c4d7] font-mono leading-relaxed animate-in fade-in slide-in-from-top-1">
            <div className="text-[#ddb7ff] font-semibold mb-1 flex items-center gap-1 font-geist">
              <Brain className="w-3.5 h-3.5" /> Reasoning Process:
            </div>
            {message.thought}
          </div>
        )}

        {/* Error Callout (if API failed) */}
        {message.isError ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-red-300">Generation Error</span>
              <p className="text-xs text-red-200/90 leading-relaxed">{message.content}</p>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold w-fit transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Request
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Response Markdown Content */
          <div className="text-[15px] leading-relaxed text-[#dfe2ef] prose-gemini">
            <ReactMarkdown components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Action Cluster Toolbar */}
        {!message.isError && (
          <div className="flex items-center gap-1.5 pt-3 mt-1 text-[#908fa0] flex-wrap">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-[#dfe2ef] transition-colors"
              title="Copy Full Text"
            >
              {copied ? <Check className="w-4 h-4 text-[#4cd7f6]" /> : <Copy className="w-4 h-4" />}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:bg-white/5 hover:text-[#dfe2ef] transition-colors"
                title="Regenerate Response"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <div className="h-3.5 w-px bg-white/10 mx-1" />

            <button
              onClick={() => onRate?.(message.id, 'up')}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                message.rating === 'up' ? 'text-[#4cd7f6] bg-white/5' : 'hover:text-[#4cd7f6]'
              }`}
              title="Helpful response"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>

            <button
              onClick={() => onRate?.(message.id, 'down')}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                message.rating === 'down' ? 'text-red-400 bg-white/5' : 'hover:text-red-400'
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleSpeech}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                isSpeakingThis ? 'text-[#4cd7f6] bg-[#4cd7f6]/10 animate-pulse' : 'hover:text-[#dfe2ef]'
              }`}
              title={isSpeakingThis ? 'Stop Reading' : 'Read Aloud'}
            >
              {isSpeakingThis ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {message.tokens && (
              <span className="font-mono text-[11px] ml-auto text-[#908fa0]/60">
                Tokens: {message.tokens.prompt || 0} prompt • {message.tokens.completion || 0} out
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
