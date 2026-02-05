import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type MessageRole = 'user' | 'assistant';

export interface Conversation {
  id: string;
  listing_id: string | null;
  guest_device_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

@Injectable()
export class ConversationService {
  private readonly supabase: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      this.supabase = createClient(url, key);
    }
  }

  private ensureClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error(
        'Supabase non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      );
    }
    return this.supabase;
  }

  async createConversation(
    listingId?: string,
    guestDeviceId?: string,
  ): Promise<Conversation> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        listing_id: listingId ?? null,
        guest_device_id: guestDeviceId ?? null,
      })
      .select('id, listing_id, guest_device_id, created_at, updated_at')
      .single();
    if (error) throw new Error(error.message);
    return data as Conversation;
  }

  async findConversation(id: string): Promise<Conversation | null> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('id, listing_id, guest_device_id, created_at, updated_at')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as Conversation;
  }

  async findLatestConversationByGuest(
    guestDeviceId: string,
  ): Promise<Conversation | null> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('id, listing_id, guest_device_id, created_at, updated_at')
      .eq('guest_device_id', guestDeviceId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as Conversation | null;
  }

  async listByGuestDeviceId(
    guestDeviceId: string,
    limit = 50,
  ): Promise<Conversation[]> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('id, listing_id, guest_device_id, created_at, updated_at')
      .eq('guest_device_id', guestDeviceId)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as Conversation[];
  }

  async getOrCreateConversation(
    conversationId: string | undefined,
    listingId?: string,
    guestDeviceId?: string,
  ): Promise<Conversation> {
    if (conversationId) {
      const existing = await this.findConversation(conversationId);
      if (existing) {
        if (
          guestDeviceId &&
          existing.guest_device_id &&
          existing.guest_device_id !== guestDeviceId
        ) {
          // Conversation belongs to another device; create new for this device
        } else {
          return existing;
        }
      }
    }
    // No conversation_id or not found: create a new conversation (fresh chat)
    return this.createConversation(listingId, guestDeviceId);
  }

  async getMessages(conversationId: string): Promise<ConversationMessage[]> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('id, conversation_id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ConversationMessage[];
  }

  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
  ): Promise<ConversationMessage> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select('id, conversation_id, role, content, created_at')
      .single();
    if (error) throw new Error(error.message);
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    return data as ConversationMessage;
  }
}
