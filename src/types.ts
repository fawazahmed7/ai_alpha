export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 string
  mimeType: string;
  isImage?: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  thought?: string;
  thoughtDuration?: number;
  tokens?: {
    prompt?: number;
    completion?: number;
  };
  isError?: boolean;
  rating?: 'up' | 'down' | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  model: string;
  messages: Message[];
  tags?: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  contextWindow: string;
}

export interface RuntimeParams {
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  systemInstruction: string;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}

export type ThemeMode = 'dark' | 'light';
