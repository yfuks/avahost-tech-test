/** UI message in the conversation list. */
export type MessageRole = 'user' | 'assistant';

export interface ChatMessageUi {
  role: MessageRole;
  content: string;
}
