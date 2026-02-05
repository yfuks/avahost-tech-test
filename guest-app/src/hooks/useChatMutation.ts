import { useMutation } from '@tanstack/react-query';
import { streamChat, type StreamChatResult } from '../api/chat';
import type { ChatMessageDto } from '../types/api';

interface StreamChatVariables {
  messages: ChatMessageDto[];
  conversation_id?: string;
  listing_id?: string;
  guest_device_id?: string;
}

/**
 * Mutation to send conversation to Ava and get the next assistant reply.
 * Pass conversation_id to persist messages in the same conversation.
 */
export function useChatMutation() {
  return useMutation<StreamChatResult, Error, StreamChatVariables>({
    mutationFn: (variables) => streamChat(variables),
  });
}
