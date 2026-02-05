export declare class ChatMessageDto {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class StreamChatDto {
    messages: ChatMessageDto[];
}
