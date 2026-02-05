import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ListRenderItem,
} from 'react-native';
import { Suspense } from 'react';
import { useChatMutation } from '../hooks/useChatMutation';
import { getGuestDeviceId } from '../lib/guestDeviceId';
import { ChatMessage } from '../components/ChatMessage';
import { ChatLoadingFallback } from '../components/ChatLoadingFallback';
import { TicketStatus } from '../components/TicketStatus';
import type { ChatMessageUi } from '../types/chat';

const LISTING_ID = 'DEMO';

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessageUi[]>([]);
  const [input, setInput] = useState('');
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [guestDeviceId, setGuestDeviceId] = useState<string | null>(null);

  useEffect(() => {
    getGuestDeviceId().then(setGuestDeviceId);
  }, []);

  const mutation = useChatMutation();

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || mutation.isPending) return;

    setInput('');
    const newUserMessage: ChatMessageUi = { role: 'user', content: trimmed };
    const nextMessages = [...messages, newUserMessage];
    setMessages(nextMessages);

    const apiMessages = nextMessages.map((m) => ({ content: m.content }));

    mutation.mutate(
      {
        messages: apiMessages,
        conversation_id: conversationId ?? undefined,
        listing_id: LISTING_ID,
        guest_device_id: guestDeviceId ?? undefined,
      },
      {
        onSuccess: (result) => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: result.content },
          ]);
          if (result.conversation_id)
            setConversationId(result.conversation_id);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Désolée, une erreur est survenue. Réessayez.',
            },
          ]);
        },
      }
    );
  }, [input, messages, mutation, conversationId, guestDeviceId]);

  const renderItem: ListRenderItem<ChatMessageUi> = useCallback(({ item }) => (
    <ChatMessage role={item.role} content={item.content} />
  ), []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Ava</Text>
        <Text style={styles.subtitle}>Votre assistante séjour</Text>
      </View>

      {currentTicketId ? (
        <Suspense fallback={<ChatLoadingFallback />}>
          <TicketStatus ticketId={currentTicketId} />
        </Suspense>
      ) : null}

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.listContent}
        inverted={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Posez une question sur le logement, confirmez votre séjour avec le
              code, ou signalez un problème (ex. internet).
            </Text>
          </View>
        }
      />

      {mutation.isPending ? (
        <View style={styles.pendingRow}>
          <Text style={styles.pendingText}>Ava écrit…</Text>
        </View>
      ) : null}

      {mutation.isError ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{mutation.error?.message}</Text>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Votre message…"
          placeholderTextColor="#94a3b8"
          editable={!mutation.isPending}
          multiline
          maxLength={16384}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, mutation.isPending && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || mutation.isPending}
        >
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </TouchableOpacity>
      </View>

      {__DEV__ ? (
        <View style={styles.devRow}>
          <TextInput
            style={styles.devInput}
            placeholder="ID ticket (UUID) pour suivi"
            placeholderTextColor="#94a3b8"
            value={currentTicketId ?? ''}
            onChangeText={(t) => setCurrentTicketId(t.trim() || null)}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  empty: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  pendingRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  errorRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    fontSize: 16,
    color: '#0f172a',
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderRadius: 22,
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  devRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  devInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    color: '#0f172a',
  },
});
