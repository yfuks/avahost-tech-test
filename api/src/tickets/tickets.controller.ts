import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ConversationService } from '../conversations/conversation.service';
import { TicketsService, type TicketStatus } from './tickets.service';
import { TicketUpdatesService } from './ticket-updates.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly ticketUpdates: TicketUpdatesService,
    private readonly conversationService: ConversationService,
  ) {}

  @Post()
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create({
      listing_id: dto.listing_id,
      category: dto.category,
    });
  }

  @Get()
  async findAll(
    @Query('conversation_id') conversationId?: string,
    @Query('guest_device_id') guestDeviceId?: string,
  ) {
    if (conversationId?.trim()) {
      const ticket = await this.ticketsService.findByConversationId(
        conversationId.trim(),
      );
      if (!ticket) throw new NotFoundException('Aucun ticket pour cette conversation');
      return ticket;
    }
    if (guestDeviceId?.trim()) {
      const conversations = await this.conversationService.listByGuestDeviceId(
        guestDeviceId.trim(),
      );
      const ids = conversations.map((c) => c.id);
      return this.ticketsService.findByConversationIds(ids);
    }
    return this.ticketsService.findAll();
  }

  /**
   * SSE stream: guest app subscribes here to be notified when admin changes ticket status.
   * Declared before GET :id so that "updates" is not captured as id.
   */
  @Get(':id/updates')
  @Sse()
  streamUpdates(
    @Param('id', ParseUUIDPipe) id: string,
  ): Observable<MessageEvent> {
    return this.ticketUpdates.subscribe(id).pipe(
      map(
        (ticket): MessageEvent => ({
          data: JSON.stringify(ticket),
          type: 'ticket_updated',
        }),
      ),
    );
  }

  /**
   * Conversation history for this ticket (admin back office).
   * Declared before GET :id so that "conversation-messages" is not captured as id.
   */
  @Get(':id/conversation-messages')
  async getConversationMessages(@Param('id', ParseUUIDPipe) id: string) {
    const ticket = await this.ticketsService.findOne(id);
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    if (!ticket.conversation_id) return [];
    return this.conversationService.getMessages(ticket.conversation_id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const ticket = await this.ticketsService.findOne(id);
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    return ticket;
  }

  @Patch(':id')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    const ticket = await this.ticketsService.updateStatus(
      id,
      dto.status as TicketStatus,
    );
    this.ticketUpdates.broadcast(ticket);
    return ticket;
  }
}
