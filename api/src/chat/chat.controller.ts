import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { StreamChatDto } from './dto/stream-chat.dto';

type ResWithFlush = Response & { flush?: () => void };

@Controller('chat')
@UseGuards(ThrottlerGuard)
@Throttle({ chat: { limit: 20, ttl: 60_000 } })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('stream')
  @HttpCode(HttpStatus.OK)
  async stream(
    @Body() dto: StreamChatDto,
    @Res({ passthrough: false }) res: ResWithFlush,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    try {
      for await (const event of this.chatService.streamChat(dto)) {
        const data =
          event.type === 'conversation_id'
            ? JSON.stringify({ conversation_id: event.conversation_id })
            : JSON.stringify({ content: event.content });
        res.write(`data: ${data}\n\n`);
        if (typeof res.flush === 'function') res.flush();
      }
      res.write('data: [DONE]\n\n');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors du streaming';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    } finally {
      res.end();
    }
  }
}
