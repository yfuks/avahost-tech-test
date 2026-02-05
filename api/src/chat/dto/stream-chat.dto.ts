import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsString,
  MaxLength,
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
}
