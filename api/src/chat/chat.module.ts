import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TicketsModule } from '../tickets/tickets.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [TicketsModule, ConversationsModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
