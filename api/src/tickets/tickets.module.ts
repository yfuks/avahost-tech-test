import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketUpdatesService } from './ticket-updates.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, TicketUpdatesService],
  exports: [TicketsService],
})
export class TicketsModule {}
