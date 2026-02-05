import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async list(@Query('guest_device_id') guestDeviceId: string | undefined) {
    if (!guestDeviceId || !guestDeviceId.trim()) {
      throw new BadRequestException('guest_device_id est requis');
    }
    return this.conversationService.listByGuestDeviceId(guestDeviceId.trim());
  }

  @Get(':id/messages')
  async getMessages(@Param('id', ParseUUIDPipe) id: string) {
    const conversation = await this.conversationService.findConversation(id);
    if (!conversation) {
      return [];
    }
    return this.conversationService.getMessages(id);
  }
}
