import React from 'react';
import { Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  streamingText?: string;
  speed?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  streamingText = '',
  speed = 'Streaming 42 tk/s',
}) => {
  return (
    <div className="flex items-start gap-3 md:gap-4 my-5 animate-in fade-in duration-200">
      {/* Sparkle badge with glowing animation */}
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#262a34] flex items-center justify-center shrink-0 mt-1 relative border border-white/10 shadow-lg">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] rounded-xl blur-[3px] opacity-60 animate-pulse pointer-events-none" />
        <Sparkles className="w-4 h-4 text-[#4cd7f6] relative z-10 animate-spin [animation-duration:4s]" />
      </div>

      <div className="flex flex-col flex-1 min-w-0 max-w-3xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#dfe2ef] font-geist">Gemini</span>
          <span className="text-xs text-[#908fa0]">• Thinking...</span>
        </div>

        {/* Live streaming text if available */}
        {streamingText ? (
          <div className="text-[15px] leading-relaxed text-[#dfe2ef] whitespace-pre-wrap">
            {streamingText}
            <span className="inline-block w-2 h-4 ml-1 bg-[#4cd7f6] animate-pulse align-middle" />
          </div>
        ) : null}

        {/* Formulating pill */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181b25]/80 border border-white/5 w-fit min-w-[280px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#8083ff] animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#ddb7ff] animate-bounce [animation-delay:0.4s]" />
          </div>
          <span className="font-mono text-xs text-[#c7c4d7]">
            Gemini is formulating response...
          </span>
          <span className="ml-auto font-mono text-[10px] text-[#4cd7f6] bg-[#262a34] px-2 py-0.5 rounded border border-white/5">
            {speed}
          </span>
        </div>
      </div>
    </div>
  );
};
