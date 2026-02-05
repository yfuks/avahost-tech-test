import { Module } from '@nestjs/common';
import { ConversationsModule } from '../conversations/conversations.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketUpdatesService } from './ticket-updates.service';

@Module({
  imports: [ConversationsModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketUpdatesService],
  exports: [TicketsService],
})
export class TicketsModule {}
