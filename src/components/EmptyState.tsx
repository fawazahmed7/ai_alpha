import React from 'react';
import { Sparkles, Terminal, Database, Cpu, Zap, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  temperature: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt, temperature }) => {
  const cards = [
    {
      title: 'Edge Stream Architecture',
      desc: 'Build a streaming chat completion route with Web Streams & low TTFT',
      prompt: 'Can you show me how to implement a streaming chat completion route in Next.js App Router using the official @google/genai SDK with markdown parsing and copyable code blocks?',
      icon: Terminal,
      color: 'text-[#4cd7f6]',
      bg: 'bg-[#4cd7f6]/10',
    },
    {
      title: 'Vector Search & pgvector',
      desc: 'Design a PostgreSQL schema with pgvector embeddings & HNSW index',
      prompt: 'Can you show me a complete PostgreSQL schema using pgvector with an HNSW cosine distance index for AI embeddings?',
      icon: Database,
      color: 'text-[#8083ff]',
      bg: 'bg-[#8083ff]/10',
    },
    {
      title: 'Zod JSON Schema & Validation',
      desc: 'Enforce structured outputs from Gemini models with TypeScript types',
      prompt: 'Show me how to configure responseSchema in Gemini generateContent to strictly return validated JSON objects with TypeScript.',
      icon: Cpu,
      color: 'text-[#ddb7ff]',
      bg: 'bg-[#ddb7ff]/10',
    },
    {
      title: 'Latency Benchmarking',
      desc: 'Measure Time-to-First-Token and token throughput under load',
      prompt: 'Write a Node.js benchmark script to measure Time-To-First-Token (TTFT) and token generation velocity for the Gemini 3.8 Flash model.',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto px-4 py-8 text-center space-y-6 animate-in fade-in duration-300">
      {/* Welcome Micro-Hero Pill Card Cluster (From Image 1.png) */}
      <div className="w-full p-4 md:p-5 rounded-2xl bg-[#141822] border border-white/10 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#4cd7f6] flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-semibold text-[#dfe2ef] font-geist">
              Ibrahim AI Studio
            </span>
            <span className="text-xs text-[#908fa0] leading-snug font-inter">
              Configured for TypeScript, streaming SSE optimizations, and local persistence.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="font-mono text-xs text-[#4cd7f6] bg-[#1c1f29] px-2.5 py-1 rounded-lg border border-white/5">
            temperature: {temperature}
          </span>
        </div>
      </div>

      {/* Starter Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-4 rounded-2xl bg-[#141822] hover:bg-[#1c1f29] border border-white/5 hover:border-white/15 transition-all duration-200 group flex flex-col justify-between gap-3 text-left shadow-sm active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-[#908fa0] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#dfe2ef] group-hover:text-white font-geist">
                  {card.title}
                </h4>
                <p className="text-[11px] text-[#908fa0] mt-1 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
