import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import type { Ticket } from './tickets.service';

@Injectable()
export class TicketUpdatesService {
  private readonly channels = new Map<string, Subject<Ticket>>();

  /**
   * Subscribe to real-time updates for a ticket (e.g. when admin changes status).
   * Caller must unsubscribe when done.
   */
  subscribe(ticketId: string) {
    let subject = this.channels.get(ticketId);
    if (!subject) {
      subject = new Subject<Ticket>();
      this.channels.set(ticketId, subject);
    }
    return subject.asObservable();
  }

  /**
   * Notify all subscribers that a ticket was updated (e.g. after PATCH).
   */
  broadcast(ticket: Ticket) {
    const subject = this.channels.get(ticket.id);
    if (subject) {
      subject.next(ticket);
    }
  }

  /**
   * Remove a subscriber channel when it has no more observers (optional cleanup).
   */
  unsubscribe(ticketId: string) {
    this.channels.delete(ticketId);
  }
}
