import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Client sends only content; roles are assigned server-side (alternating user/assistant). */
export class ChatMessageDto {
  @IsString()
  @MaxLength(16_384)
  content!: string;
}

export class StreamChatDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins un message est requis' })
  @ArrayMaxSize(50, { message: 'Maximum 50 messages par conversation' })
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  /** Optional: reuse an existing conversation (messages are persisted). */
  @IsOptional()
  @IsUUID()
  conversation_id?: string;

  /** Optional: listing id for new conversations (e.g. "DEMO"). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  listing_id?: string;

  /** Optional: guest device unique id (e.g. phone UUID) so conversations are scoped per device. */
  @IsOptional()
  @IsString()
  @MaxLength(256)
  guest_device_id?: string;
}
