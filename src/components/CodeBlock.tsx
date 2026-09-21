import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  onOpenSandbox?: () => void;
  onCopySuccess?: () => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  onOpenSandbox,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  // Normalize code and lines
  const cleanCode = code.replace(/\n$/, '');
  const lines = cleanCode.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = cleanCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayFilename = filename || (language ? `snippet.${language.toLowerCase()}` : 'code');

  return (
    <div className="rounded-2xl bg-[#0a0e17] border border-white/10 shadow-2xl overflow-hidden my-3.5 group">
      {/* Header Toolbar */}
      <div className="px-4 py-2.5 bg-[#181b25]/90 border-b border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 pl-1 text-[#dfe2ef] font-mono font-medium">
            <Terminal className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span className="text-[#dfe2ef]">{displayFilename}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {language && (
            <span className="font-mono text-[10px] text-[#c7c4d7] uppercase tracking-wider px-2 py-0.5 rounded bg-[#262a34]">
              {language}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#262a34] hover:bg-[#31353f] text-[#dfe2ef] font-mono text-[11px] transition-all active:scale-95 border border-white/5"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span className="text-[#4cd7f6]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#908fa0]" />
                <span>Copy</span>
              </>
            )}
          </button>
          {onOpenSandbox && (
            <button
              onClick={onOpenSandbox}
              className="p-1 rounded-lg hover:bg-[#31353f] text-[#908fa0] hover:text-[#4cd7f6] transition-colors"
              title="Open in Inspector"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Code Block with Line Numbers */}
      <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed flex gap-4 text-[#dfe2ef] select-text">
        <div className="select-none text-right font-mono text-[#908fa0]/40 space-y-0.5 shrink-0 min-w-[1.5rem]">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-relaxed">
              {String(idx + 1).padStart(2, '0')}
            </div>
          ))}
        </div>
        <pre className="flex-1 overflow-x-auto text-[#dfe2ef] font-mono leading-relaxed space-y-0.5">
          <code>{cleanCode}</code>
        </pre>
      </div>
    </div>
  );
};
