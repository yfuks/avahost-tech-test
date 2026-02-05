import { StreamChatDto } from './dto/stream-chat.dto';
export declare class ChatService {
    private readonly openai;
    constructor();
    streamChat(dto: StreamChatDto): AsyncGenerator<string, void, unknown>;
}
