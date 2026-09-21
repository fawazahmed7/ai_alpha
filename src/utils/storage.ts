import { Conversation, Message, RuntimeParams, ThemeMode } from '../types';

const STORAGE_KEY_CONVERSATIONS = 'gemini_studio_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'gemini_studio_active_id_v1';
const STORAGE_KEY_PARAMS = 'gemini_studio_params_v1';
const STORAGE_KEY_THEME = 'gemini_studio_theme_v1';

export const DEFAULT_RUNTIME_PARAMS: RuntimeParams = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 4096,
  systemInstruction: 'You are Ibrahim, an expert AI software architect and technical assistant. Provide accurate, clean, production-ready code with concise technical explanations.',
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'thread-nextjs-stream',
    title: 'Next.js 14 App Router & Gemini Stream',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
    pinned: true,
    model: 'gemini-3.8-flash',
    tags: ['@google/genai SDK', 'Streaming'],
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Can you show me how to implement a streaming chat completion route in Next.js App Router using the official `@google/genai` SDK with markdown parsing and copyable code blocks?',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Here is the recommended implementation using the official \`@google/genai\` SDK in Next.js 14+ (App Router). We leverage edge-friendly Web Streams via \`generateContentStream\` for ultra-low Time-To-First-Token (TTFT).

### Architecture Highlights
- **Edge Streams**: Transfer-Encoding chunked with native Web Streams.
- **SDK Package**: \`@google/genai\` with native Gemini 3.8 and Gemini 3 Flash support.
- **Safety Settings**: Configurable safety and system instructions.

\`\`\`typescript app/api/chat/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize client with environment key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

export async function POST(req: NextRequest) {
  const { messages, model = 'gemini-3.8-flash' } = await req.json();
  
  // Transform client messages to contents array
  const contents = messages.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Invoke streaming response generator
  const responseStream = await ai.models.generateContentStream({
    model,
    contents,
  });

  return new Response(responseStream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
}
\`\`\`

Key advantages of this pattern:
- **Zero Buffering**: Directly returns the underlying Web ReadableStream with immediate token pushes.
- **Client Markdown**: Fully compatible with \`react-markdown\` and streaming syntax highlighters.`,
        timestamp: Date.now() - 3600000 * 2 + 15000,
        thought: 'Analyzed Next.js App Router streaming specs, evaluated @google/genai SDK generateContentStream API, constructed zero-buffering response pattern with proper error boundaries.',
        thoughtDuration: 1.2,
        tokens: { prompt: 384, completion: 412 },
      },
      {
        id: 'msg-3',
        role: 'user',
        content: 'Awesome! Does this persist in browser localStorage automatically across reloads?',
        timestamp: Date.now() - 3600000 * 2 + 30000,
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `Yes! The client storage synchronizer in this workspace handles instant persistence. Here is how state synchronization is guaranteed:

- **Reactive LocalStorage Synchronizer**: Updates write atomically upon every incoming SSE chunk delimiter without thread lag.
- **Offline Recovery & Rehydration**: Initializes state prior to client paint, eliminating layout shifts and conversation loss on browser refresh.
- **CRUD Operations**: Full support for Creating, Renaming, Pinning, and Deleting individual sessions, or clearing the entire archive.`,
        timestamp: Date.now() - 3600000 * 2 + 45000,
        tokens: { prompt: 142, completion: 180 },
      },
    ],
  },
  {
    id: 'thread-stream-arch',
    title: 'Gemini API Stream Architecture',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
    model: 'gemini-3.8-flash',
    tags: ['Architecture'],
    messages: [
      {
        id: 'msg-arch-1',
        role: 'user',
        content: 'How does Gemini generateContentStream handle network backpressure and SSE events?',
        timestamp: Date.now() - 3600000 * 4,
      },
      {
        id: 'msg-arch-2',
        role: 'assistant',
        content: `Gemini's \`generateContentStream\` returns an AsyncIterable of \`GenerateContentResponse\` chunks. 

When piped through an HTTP stream with SSE formatting:
1. Each chunk emits \`data: {"text": "...", "done": false}\\n\\n\`
2. The client's \`ReadableStreamDefaultReader\` reads chunks incrementally without waiting for complete payload generation.
3. This cuts Time To First Token (TTFT) from several seconds down to under 250 milliseconds.`,
        timestamp: Date.now() - 3600000 * 4 + 10000,
      },
    ],
  },
  {
    id: 'thread-db-vector',
    title: 'Database Schema Vector Index',
    createdAt: Date.now() - 86400000 * 1, // Yesterday
    updatedAt: Date.now() - 86400000 * 1,
    model: 'gemini-3.8-flash',
    tags: ['PostgreSQL', 'Vectors'],
    messages: [
      {
        id: 'msg-db-1',
        role: 'user',
        content: 'Can you show me a PostgreSQL schema with pgvector for cosine distance similarity searches?',
        timestamp: Date.now() - 86400000 * 1,
      },
      {
        id: 'msg-db-2',
        role: 'assistant',
        content: `Here is the DDL schema for pgvector cosine indexing:

\`\`\`sql schema.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768), -- Gemini Text Embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for high-speed approximate nearest neighbor search
CREATE INDEX idx_documents_embedding_hnsw 
ON documents USING hnsw (embedding vector_cosine_ops);
\`\`\``,
        timestamp: Date.now() - 86400000 * 1 + 12000,
      },
    ],
  },
  {
    id: 'thread-k8s',
    title: 'Kubernetes Canary Rollout Manifests',
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    updatedAt: Date.now() - 86400000 * 3,
    model: 'gemini-3.8-flash',
    tags: ['DevOps', 'K8s'],
    messages: [
      {
        id: 'msg-k8s-1',
        role: 'user',
        content: 'Provide an Istio VirtualService configuration for 90/10 traffic split canary rollout.',
        timestamp: Date.now() - 86400000 * 3,
      },
      {
        id: 'msg-k8s-2',
        role: 'assistant',
        content: `Here is the Istio VirtualService manifest:

\`\`\`yaml canary-virtualservice.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: api-gateway-route
spec:
  hosts:
  - "api.production.internal"
  http:
  - route:
    - destination:
        host: api-service
        subset: stable
      weight: 90
    - destination:
        host: api-service
        subset: canary
      weight: 10
\`\`\``,
        timestamp: Date.now() - 86400000 * 3 + 8000,
      },
    ],
  },
];

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) {
      saveConversations(INITIAL_CONVERSATIONS);
      return INITIAL_CONVERSATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveConversations(INITIAL_CONVERSATIONS);
    return INITIAL_CONVERSATIONS;
  } catch (err) {
    console.error('Error loading conversations from localStorage:', err);
    return INITIAL_CONVERSATIONS;
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (err) {
    console.error('Error saving conversations to localStorage:', err);
  }
}

export function createNewConversation(title = 'New Chat', model = 'gemini-3.8-flash'): Conversation {
  const newConv: Conversation = {
    id: 'thread-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model,
    messages: [],
    pinned: false,
  };
  const list = loadConversations();
  const updated = [newConv, ...list];
  saveConversations(updated);
  saveActiveConversationId(newConv.id);
  return newConv;
}

export function updateConversation(id: string, updates: Partial<Conversation>): Conversation[] {
  const list = loadConversations();
  const updated = list.map((c) => {
    if (c.id === id) {
      return { ...c, ...updates, updatedAt: Date.now() };
    }
    return c;
  });
  saveConversations(updated);
  return updated;
}

export function deleteConversation(id: string): Conversation[] {
  const list = loadConversations();
  const updated = list.filter((c) => c.id !== id);
  saveConversations(updated);
  return updated;
}

export function clearAllConversations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
  } catch (err) {
    console.error('Error clearing localStorage:', err);
  }
}

export function loadActiveConversationId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (id) return id;
  } catch {}
  return INITIAL_CONVERSATIONS[0].id;
}

export function saveActiveConversationId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch {}
}

export function loadRuntimeParams(): RuntimeParams {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARAMS);
    if (raw) return { ...DEFAULT_RUNTIME_PARAMS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_RUNTIME_PARAMS;
}

export function saveRuntimeParams(params: RuntimeParams): void {
  try {
    localStorage.setItem(STORAGE_KEY_PARAMS, JSON.stringify(params));
  } catch {}
}

export function loadTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(STORAGE_KEY_THEME);
    if (theme === 'light' || theme === 'dark') return theme;
  } catch {}
  return 'dark'; // Default dark mode
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch {}
}

export function getStorageUsage(): { usedBytes: number; usedFormatted: string; percent: number } {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2; // UTF-16
      }
    }
    const max = 10 * 1024 * 1024; // 10MB approx
    const usedMB = (total / (1024 * 1024)).toFixed(1);
    const percent = Math.min(100, Math.max(1, Math.round((total / max) * 100)));
    return {
      usedBytes: total,
      usedFormatted: `${usedMB} MB / 10 MB`,
      percent: Math.max(percent, 5),
    };
  } catch {
    return { usedBytes: 1024 * 100, usedFormatted: '0.1 MB / 10 MB', percent: 5 };
  }
}
