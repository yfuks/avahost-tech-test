import { useMutation } from '@tanstack/react-query';
import { streamChat } from '../api/chat';
import type { ChatMessageDto } from '../types/api';

interface StreamChatVariables {
  messages: ChatMessageDto[];
}

/**
 * Mutation to send conversation to Ava and get the next assistant reply.
 */
export function useChatMutation() {
  return useMutation<string, Error, StreamChatVariables>({
    mutationFn: ({ messages }) => streamChat(messages),
  });
}
