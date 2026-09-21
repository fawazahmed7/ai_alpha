import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please configure it in the Secrets panel or environment variables.');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ibrahim-ai-studio',
        },
      },
    });
  }
  return geminiClient;
}

// Health & Status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    defaultModel: 'gemini-3.8-flash',
  });
});

// Available models endpoint
app.get('/api/models', (req: Request, res: Response) => {
  res.json({
    models: [
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
    ],
  });
});

// Chat completion endpoint with SSE streaming
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      model = 'gemini-3.8-flash',
      systemInstruction,
      temperature = 0.7,
      topP = 0.95,
      maxOutputTokens,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(500).json({
        error: err.message || 'Gemini API key is not configured.',
        code: 'MISSING_API_KEY',
      });
    }

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Map client messages to Gemini content parts
    // Support image attachments if provided
    const contents = messages.map((msg: any) => {
      const parts: any[] = [];

      if (msg.images && Array.isArray(msg.images)) {
        for (const img of msg.images) {
          if (img.data && img.mimeType) {
            parts.push({
              inlineData: {
                data: img.data,
                mimeType: img.mimeType,
              },
            });
          }
        }
      }

      if (msg.text) {
        parts.push({ text: msg.text });
      } else if (msg.content) {
        parts.push({ text: msg.content });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: parts.length > 0 ? parts : [{ text: '' }],
      };
    });

    const config: any = {
      temperature: Number(temperature) || 0.7,
      topP: Number(topP) || 0.95,
    };

    if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
      config.systemInstruction = systemInstruction.trim();
    }

    if (maxOutputTokens && Number(maxOutputTokens) > 0) {
      config.maxOutputTokens = Number(maxOutputTokens);
    }

    let targetModel = model;
    let streamSuccess = false;

    // Helper to stream chunks
    const streamModelResponse = async (m: string) => {
      const responseStream = await ai.models.generateContentStream({
        model: m,
        contents,
        config,
      });

      for await (const chunk of responseStream) {
        const chunkText = chunk.text || '';
        res.write(`data: ${JSON.stringify({ text: chunkText, done: false })}\n\n`);
      }
    };

    try {
      await streamModelResponse(targetModel);
      streamSuccess = true;
    } catch (firstErr: any) {
      const errStr = (firstErr?.message || '') + JSON.stringify(firstErr || {});
      const isOverloaded = errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand');

      if (isOverloaded && targetModel !== 'gemini-3.1-flash-lite') {
        console.warn(`Model ${targetModel} encountered 503/high demand. Seamlessly falling back to gemini-3.1-flash-lite...`);
        targetModel = 'gemini-3.1-flash-lite';
        await streamModelResponse(targetModel);
        streamSuccess = true;
      } else {
        throw firstErr;
      }
    }

    if (streamSuccess) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errorMessage = error?.message || 'An unexpected error occurred while communicating with Gemini API.';

    // If headers haven't sent yet, respond with JSON
    if (!res.headersSent) {
      return res.status(500).json({
        error: errorMessage,
        code: 'GEMINI_API_ERROR',
      });
    }

    // If streaming already started, send error event through SSE
    res.write(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`);
    res.end();
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ibrahim Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
