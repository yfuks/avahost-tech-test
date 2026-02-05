import { getApiUrl } from './client';
import type { ChatMessageDto } from '../types/api';

/**
 * Send messages to POST /chat/stream and return the full assistant reply.
 * Parses SSE from response (React Native often has no ReadableStream, so we use response.text()).
 */
export async function streamChat(messages: ChatMessageDto[]): Promise<string> {
  const url = `${getApiUrl()}/chat/stream`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erreur ${res.status}`;
    try {
      const json = JSON.parse(text) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      if (text) message = text.slice(0, 200);
    }
    throw new Error(message);
  }

  const raw = await res.text();
  const lines = raw.split('\n');
  let content = '';
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const payload = line.slice(6);
      if (payload === '[DONE]') break;
      try {
        const data = JSON.parse(payload) as { error?: string; content?: string };
        if (data.error) throw new Error(data.error);
        if (typeof data.content === 'string') content += data.content;
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
  return content;
}
