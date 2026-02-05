import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AVA_SYSTEM_PROMPT } from './prompts/ava-system.prompt';
import { sanitizeUserContent } from './sanitize-user-content';
import type { StreamChatDto } from './dto/stream-chat.dto';
import { TicketsService } from '../tickets/tickets.service';
import { ConversationService } from '../conversations/conversation.service';
import listingMock from '../../mocks/listingMock';

export type StreamChatEvent =
  | { type: 'conversation_id'; conversation_id: string }
  | { type: 'content'; content: string };

type ValidateConfirmationCodeArgs = { code: string };
type CreateTicketArgs = { listing_id: string; category: string };

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

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly conversationService: ConversationService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async *streamChat(
    dto: StreamChatDto,
  ): AsyncGenerator<StreamChatEvent, void, unknown> {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY non configurée');
    }

    let conversationId: string | null = null;
    try {
      const conversation =
        await this.conversationService.getOrCreateConversation(
          dto.conversation_id,
          dto.listing_id,
          dto.guest_device_id,
        );
      conversationId = conversation.id;
      const lastMessage = dto.messages[dto.messages.length - 1];
      if (lastMessage?.content) {
        await this.conversationService.addMessage(
          conversation.id,
          'user',
          sanitizeUserContent(lastMessage.content),
        );
      }
    } catch {
      // If Supabase is not configured, continue without persisting
    }

    if (conversationId) {
      yield { type: 'conversation_id', conversation_id: conversationId };
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: AVA_SYSTEM_PROMPT },
      ...dto.messages.map((m, i) => {
        const role: 'user' | 'assistant' = i % 2 === 0 ? 'user' : 'assistant';
        return { role, content: sanitizeUserContent(m.content) };
      }),
    ];

    const ticketsService = this.ticketsService;
    const expectedCode =
      listingMock.privateHostData.stay.confirmationCode.trim();
    const tools: RunnableTool[] = [
      {
        type: 'function',
        function: {
          name: 'validate_confirmation_code',
          description:
            'Vérifie si le code de confirmation de séjour fourni par le voyageur est valide. À appeler avec le code que le voyageur a donné dans son message. Retourne { valid: true } si le code est correct, { valid: false } sinon. Ne jamais divulguer de données sensibles ni appeler get_private_host_data sans avoir reçu valid: true.',
          parameters: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description:
                  'Le code de confirmation de séjour fourni par le voyageur',
              },
            },
            required: ['code'],
          },
          parse: (input: string) =>
            JSON.parse(input) as ValidateConfirmationCodeArgs,
          function: (args: unknown) => {
            const { code } = args as ValidateConfirmationCodeArgs;
            const valid =
              typeof code === 'string' &&
              code.trim().toUpperCase() === expectedCode.toUpperCase();
            return Promise.resolve({ valid });
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_public_listing_data',
          description:
            'Récupère les informations PUBLIQUES du logement (description, équipements, capacité, règles, check-in/out, activités, etc.). Accessible à tout moment, SANS code de confirmation. À utiliser pour toute question sur le logement tant que les données sensibles (Wi-Fi, boîte à clé, contacts) ne sont pas demandées.',
          parameters: {
            type: 'object',
            properties: {},
          },
          parse: () => ({}),
          function: () => Promise.resolve(listingMock.publicListingData),
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_private_host_data',
          description:
            "Récupère les données SENSIBLES du logement (identifiants Wi-Fi, code boîte à clé, procédure de dépannage internet, contacts d'urgence). À appeler UNIQUEMENT après que validate_confirmation_code a renvoyé valid: true pour le code fourni par le voyageur. Ne jamais appeler cet outil sans avoir validé le code au préalable.",
          parameters: {
            type: 'object',
            properties: {},
          },
          parse: () => ({}),
          function: () => {
            const { stay, ...rest } = listingMock.privateHostData;
            const { lockboxCode } = stay;
            return Promise.resolve({
              ...rest,
              stay: { lockboxCode },
            });
          },
        },
      },
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
          parse: (input: string) => JSON.parse(input) as CreateTicketArgs,
          function: async (args: unknown) => {
            const a = args as CreateTicketArgs;
            const ticket = await ticketsService.create({
              ...a,
              conversation_id: conversationId ?? undefined,
            });
            return { id: ticket.id, status: ticket.status };
          },
        },
      },
    ];

    const runner = this.openai.chat.completions.runTools({
      model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
      messages,
      stream: true,
      tools: tools as Parameters<
        OpenAI['chat']['completions']['runTools']
      >[0]['tools'],
      max_tokens: 2048,
    });

    let fullContent = '';
    for await (const chunk of runner) {
      const delta = chunk.choices[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) {
        fullContent += delta;
        yield { type: 'content', content: delta };
      }
    }

    if (conversationId && fullContent.trim()) {
      try {
        await this.conversationService.addMessage(
          conversationId,
          'assistant',
          fullContent.trim(),
        );
      } catch {
        // Ignore persist errors
      }
    }
  }
}
