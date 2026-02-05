import { getApiUrl } from './client';

export interface ConversationListItem {
  id: string;
  listing_id: string | null;
  guest_device_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessageDto {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function getConversations(
  guestDeviceId: string
): Promise<ConversationListItem[]> {
  const url = `${getApiUrl()}/conversations?guest_device_id=${encodeURIComponent(guestDeviceId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(res.status === 400 ? 'Paramètre manquant' : text || `Erreur ${res.status}`);
  }
  return res.json() as Promise<ConversationListItem[]>;
}

export async function getConversationMessages(
  conversationId: string
): Promise<ConversationMessageDto[]> {
  const url = `${getApiUrl()}/conversations/${encodeURIComponent(conversationId)}/messages`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erreur ${res.status}`);
  }
  return res.json() as Promise<ConversationMessageDto[]>;
}
