import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type TicketStatus = 'created' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  listing_id: string;
  category: string;
  status: TicketStatus;
  updated_at: string;
  conversation_id?: string | null;
}

export interface CreateTicketInput {
  listing_id: string;
  category: string;
  conversation_id?: string;
}

@Injectable()
export class TicketsService {
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
      throw new Error('Supabase non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    }
    return this.supabase;
  }

  async create(input: CreateTicketInput): Promise<Ticket> {
    const supabase = this.ensureClient();

    if (input.conversation_id) {
      const existing = await supabase
        .from('tickets')
        .select('id, listing_id, category, status, updated_at, conversation_id')
        .eq('conversation_id', input.conversation_id)
        .in('status', ['created', 'in_progress'])
        .maybeSingle();
      if (existing.error) throw new Error(existing.error.message);
      if (existing.data) return existing.data as Ticket;
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        listing_id: input.listing_id,
        category: input.category,
        conversation_id: input.conversation_id ?? null,
        status: 'created',
      })
      .select('id, listing_id, category, status, updated_at, conversation_id')
      .single();
    if (error) {
      if (
        error.code === '23505' &&
        input.conversation_id
      ) {
        const existing = await supabase
          .from('tickets')
          .select('id, listing_id, category, status, updated_at, conversation_id')
          .eq('conversation_id', input.conversation_id)
          .in('status', ['created', 'in_progress'])
          .maybeSingle();
        if (existing.data) return existing.data as Ticket;
      }
      throw new Error(error.message);
    }
    return data as Ticket;
  }

  async findAll(): Promise<Ticket[]> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('tickets')
      .select('id, listing_id, category, status, updated_at, conversation_id')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Ticket[];
  }

  async findOne(id: string): Promise<Ticket | null> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('tickets')
      .select('id, listing_id, category, status, updated_at, conversation_id')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as Ticket;
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, listing_id, category, status, updated_at, conversation_id')
      .single();
    if (error) throw new Error(error.message);
    return data as Ticket;
  }
}
