import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { StreamChatDto } from './dto/stream-chat.dto';

@Injectable()
export class ChatService {
  private readonly openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async *streamChat(dto: StreamChatDto): AsyncGenerator<string, void, unknown> {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY non configurée');
    }

    const messages: ChatCompletionMessageParam[] = dto.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const stream = await this.openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 2048,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) {
        yield delta;
      }
    }
  }
}
