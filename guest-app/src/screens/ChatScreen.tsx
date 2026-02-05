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
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Suspense } from 'react';
import { useChatMutation } from '../hooks/useChatMutation';
import { getGuestDeviceId } from '../lib/guestDeviceId';
import { ChatMessage } from '../components/ChatMessage';
import { ChatLoadingFallback } from '../components/ChatLoadingFallback';
import { TicketStatus } from '../components/TicketStatus';
import {
  getConversations,
  getConversationMessages,
  type ConversationListItem,
} from '../api/conversations';
import { getTicketByConversationId } from '../api/tickets';
import type { ChatMessageUi } from '../types/chat';

const LISTING_ID = 'DEMO';

function formatConversationDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatConversationTitle(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return `Conversation du ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  const dateStr = d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
  return `Conversation du ${dateStr}`;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessageUi[]>([]);
  const [input, setInput] = useState('');
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [guestDeviceId, setGuestDeviceId] = useState<string | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    getGuestDeviceId().then(setGuestDeviceId);
  }, []);

  // Derive ticket for current conversation so user sees status without entering ticket ID
  useEffect(() => {
    if (!conversationId) {
      setCurrentTicketId(null);
      return;
    }
    getTicketByConversationId(conversationId)
      .then((ticket) => setCurrentTicketId(ticket?.id ?? null))
      .catch(() => setCurrentTicketId(null));
  }, [conversationId]);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    if (guestDeviceId) {
      setLoadingConversations(true);
      getConversations(guestDeviceId)
        .then(setConversations)
        .catch(() => setConversations([]))
        .finally(() => setLoadingConversations(false));
    }
  }, [guestDeviceId]);

  const startNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setCurrentTicketId(null);
    setPanelOpen(false);
  }, []);

  const selectConversation = useCallback(
    async (conv: ConversationListItem) => {
      setLoadingMessages(true);
      try {
        const msgs = await getConversationMessages(conv.id);
        const ui: ChatMessageUi[] = msgs.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        setConversationId(conv.id);
        setMessages(ui);
        setPanelOpen(false);
      } catch {
        setConversations((prev) => prev);
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

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
          if (result.conversation_id) {
            setConversationId(result.conversation_id);
            getTicketByConversationId(result.conversation_id)
              .then((ticket) => setCurrentTicketId(ticket?.id ?? null))
              .catch(() => {});
          }
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

  const renderConversationItem: ListRenderItem<ConversationListItem> =
    useCallback(
      ({ item }) => (
        <TouchableOpacity
          style={[
            styles.convItem,
            item.id === conversationId && styles.convItemActive,
          ]}
          onPress={() => selectConversation(item)}
          disabled={loadingMessages}
        >
          <Text style={styles.convItemTitle} numberOfLines={1}>
            {formatConversationTitle(item.updated_at)}
          </Text>
          <Text style={styles.convItemDate} numberOfLines={1}>
            {formatConversationDate(item.updated_at)}
          </Text>
        </TouchableOpacity>
      ),
      [conversationId, loadingMessages, selectConversation]
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {panelOpen ? (
        <>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Conversations</Text>
              <TouchableOpacity
                onPress={() => setPanelOpen(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.panelClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.newChatBtn}
              onPress={startNewChat}
              disabled={loadingMessages}
            >
              <Text style={styles.newChatBtnText}>+ Nouvelle conversation</Text>
            </TouchableOpacity>
            {loadingConversations ? (
              <View style={styles.panelLoading}>
                <ActivityIndicator size="small" color="#64748b" />
              </View>
            ) : (
              <FlatList
                data={conversations}
                renderItem={renderConversationItem}
                keyExtractor={(item) => item.id}
                style={styles.convList}
                contentContainerStyle={styles.convListContent}
                ListEmptyComponent={
                  <Text style={styles.convEmpty}>
                    Aucune conversation passée
                  </Text>
                }
              />
            )}
          </View>
          <Pressable
            style={styles.panelOverlay}
            onPress={() => setPanelOpen(false)}
          />
        </>
      ) : null}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={openPanel}
          style={styles.menuBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Ava</Text>
          <Text style={styles.subtitle}>Votre assistante séjour</Text>
        </View>
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

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    zIndex: 10,
    paddingTop: 56,
  },
  panelOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 9,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  panelClose: {
    fontSize: 20,
    color: '#64748b',
    padding: 4,
  },
  newChatBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 10,
  },
  newChatBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  panelLoading: {
    padding: 24,
    alignItems: 'center',
  },
  convList: {
    flex: 1,
  },
  convListContent: {
    paddingBottom: 24,
  },
  convItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  convItemActive: {
    backgroundColor: '#f1f5f9',
  },
  convItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  convItemDate: {
    fontSize: 13,
    color: '#64748b',
  },
  convEmpty: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  menuBtn: {
    padding: 4,
  },
  menuBtnText: {
    fontSize: 22,
    color: '#0f172a',
    fontWeight: '600',
  },
  headerTitles: {
    flex: 1,
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
});
