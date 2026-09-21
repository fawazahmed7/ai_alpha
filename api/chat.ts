import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface VercelRequest extends IncomingMessage {
  body: any;
  query: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (jsonBody: any) => VercelResponse;
  send: (body: any) => VercelResponse;
}

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(apiKey: string): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ibrahim-ai-studio-vercel',
        },
      },
    });
  }
  return geminiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error:
          'GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables, then redeploy.',
        code: 'MISSING_API_KEY',
      })
    );
    return;
  }

  try {
    // Parse body safely whether pre-parsed by Vercel or raw string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      // In case body was not parsed by Vercel middleware, read stream
      body = await new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });
        req.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve({});
          }
        });
        req.on('error', () => resolve({}));
      });
    }

    const {
      messages = [],
      model = 'gemini-3.8-flash',
      systemInstruction,
      temperature = 0.7,
      topP = 0.95,
      maxOutputTokens,
    } = body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Messages array is required and cannot be empty.' }));
      return;
    }

    const ai = getGeminiClient(apiKey);

    // Set SSE headers for real-time streaming
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Build Gemini contents array
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
      const isOverloaded =
        errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand');

      if (isOverloaded && targetModel !== 'gemini-3.1-flash-lite') {
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
    console.error('Gemini API Handler Error:', error);
    const errorMessage =
      error?.message || 'An unexpected error occurred while communicating with the Gemini API.';

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: errorMessage, code: 'GEMINI_API_ERROR' }));
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`);
      res.end();
    }
  }
}
