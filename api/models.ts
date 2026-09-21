import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (jsonBody: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
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
    })
  );
}
