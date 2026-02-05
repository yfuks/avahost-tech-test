import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AVA_SYSTEM_PROMPT } from './prompts/ava-system.prompt';
import { sanitizeUserContent } from './sanitize-user-content';
import type { StreamChatDto } from './dto/stream-chat.dto';
import { TicketsService } from '../tickets/tickets.service';

type CreateTicketArgs = { listing_id: string; category: string };
type GetTicketArgs = { ticket_id: string };

/** Runnable tool shape for openai.chat.completions.runTools (includes parse + function). */
type RunnableTool = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
    parse: (input: string) => unknown;
    function: (args: unknown) => Promise<unknown>;
  };
};

@Injectable()
export class ChatService {
  private readonly openai: OpenAI | null = null;

  constructor(private readonly ticketsService: TicketsService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async *streamChat(dto: StreamChatDto): AsyncGenerator<string, void, unknown> {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY non configurée');
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: AVA_SYSTEM_PROMPT },
      ...dto.messages.map((m, i) => {
        const role: 'user' | 'assistant' =
          i % 2 === 0 ? 'user' : 'assistant';
        return { role, content: sanitizeUserContent(m.content) };
      }),
    ];

    const ticketsService = this.ticketsService;
    const tools: RunnableTool[] = [
      {
        type: 'function',
        function: {
          name: 'create_ticket',
          description:
            'Crée un ticket de support pour le logement. À utiliser quand le voyageur a un problème persistant (ex. internet) après avoir suivi les étapes Wi-Fi et dépannage. listing_id doit être "DEMO" pour le logement de démo.',
          parameters: {
            type: 'object',
            properties: {
              listing_id: {
                type: 'string',
                description: "Identifiant du logement (ex. 'DEMO')",
              },
              category: {
                type: 'string',
                enum: ['internet', 'equipment', 'access', 'other'],
                description: "Catégorie du ticket (ex. 'internet')",
              },
            },
            required: ['listing_id', 'category'],
          },
          parse: (input: string) =>
            JSON.parse(input) as CreateTicketArgs,
          function: async (args: unknown) => {
            const a = args as CreateTicketArgs;
            const ticket = await ticketsService.create(a);
            return { id: ticket.id, status: ticket.status };
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_ticket',
          description:
            "Récupère le statut d'un ticket existant. À utiliser quand le voyageur demande un suivi ou le statut de son ticket (créé, en cours, résolu).",
          parameters: {
            type: 'object',
            properties: {
              ticket_id: {
                type: 'string',
                description: "UUID du ticket (fourni lors de la création)",
              },
            },
            required: ['ticket_id'],
          },
          parse: (input: string) => JSON.parse(input) as GetTicketArgs,
          function: async (args: unknown) => {
            const a = args as GetTicketArgs;
            const ticket = await ticketsService.findOne(a.ticket_id);
            if (!ticket) return { error: 'Ticket introuvable' };
            return {
              id: ticket.id,
              status: ticket.status,
              updated_at: ticket.updated_at,
            };
          },
        },
      },
    ];

    const runner = this.openai.chat.completions.runTools({
      model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
      messages,
      stream: true,
      tools: tools as Parameters<OpenAI['chat']['completions']['runTools']>[0]['tools'],
      max_tokens: 2048,
    });

    for await (const chunk of runner) {
      const delta = chunk.choices[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) {
        yield delta;
      }
    }
  }
}
