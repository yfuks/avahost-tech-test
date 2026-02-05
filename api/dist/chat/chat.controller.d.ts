import type { Response } from 'express';
import { ChatService } from './chat.service';
import { StreamChatDto } from './dto/stream-chat.dto';
type ResWithFlush = Response & {
    flush?: () => void;
};
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    stream(dto: StreamChatDto, res: ResWithFlush): Promise<void>;
}
export {};
