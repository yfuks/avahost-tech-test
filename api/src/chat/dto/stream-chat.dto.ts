import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsIn,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsIn(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

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
