import { getApiUrl } from './client';
import type { ChatMessageDto } from '../types/api';

export interface StreamChatOptions {
  messages: ChatMessageDto[];
  conversation_id?: string;
  listing_id?: string;
  guest_device_id?: string;
}

export interface StreamChatResult {
  content: string;
  conversation_id?: string;
}

/**
 * Send messages to POST /chat/stream and return the full assistant reply.
 * Parses SSE from response (React Native often has no ReadableStream, so we use response.text()).
 * If the server returns conversation_id, include it so the client can send it on the next request.
 */
export async function streamChat(
  options: StreamChatOptions
): Promise<StreamChatResult> {
  const { messages, conversation_id, listing_id, guest_device_id } = options;
  const url = `${getApiUrl()}/chat/stream`;
  const body: Record<string, unknown> = { messages };
  if (conversation_id) body.conversation_id = conversation_id;
  if (listing_id) body.listing_id = listing_id;
  if (guest_device_id) body.guest_device_id = guest_device_id;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
  let conversationId: string | undefined;
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const payload = line.slice(6);
      if (payload === '[DONE]') break;
      try {
        const data = JSON.parse(payload) as {
          error?: string;
          content?: string;
          conversation_id?: string;
        };
        if (data.error) throw new Error(data.error);
        if (typeof data.conversation_id === 'string')
          conversationId = data.conversation_id;
        if (typeof data.content === 'string') content += data.content;
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
  return { content, conversation_id: conversationId };
}
