import React, { useEffect, useRef, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { getTicket } from '../api/tickets';
import type { TicketStatus as TicketStatusType } from '../types/api';

const statusLabels: Record<TicketStatusType, string> = {
  created: 'Créé',
  in_progress: 'En cours',
  resolved: 'Résolu',
};

const POLL_INTERVAL_MS = 3_000;
const NOTIFICATION_DURATION_MS = 12_000;

interface TicketStatusProps {
  ticketId: string;
}

export function TicketStatus({ ticketId }: TicketStatusProps) {
  const { data: ticket } = useSuspenseQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket(ticketId),
    staleTime: 0,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const prevStatusRef = useRef<TicketStatusType | null>(null);
  const [notification, setNotification] = useState<TicketStatusType | null>(null);

  useEffect(() => {
    if (prevStatusRef.current === null) {
      prevStatusRef.current = ticket.status;
      return;
    }
    if (prevStatusRef.current !== ticket.status) {
      prevStatusRef.current = ticket.status;
      setNotification(ticket.status);
      const t = setTimeout(() => setNotification(null), NOTIFICATION_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [ticket.status, ticket.updated_at]);

  return (
    <View style={styles.wrapper}>
      {notification ? (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>
            {notification === 'resolved'
              ? 'Votre ticket est résolu.'
              : `Votre ticket a été mis à jour : ${statusLabels[notification] ?? notification}`}
          </Text>
        </View>
      ) : null}
      <View style={styles.container}>
        <Text style={styles.label}>Suivi du ticket</Text>
        <Text style={styles.status}>
          Statut : {statusLabels[ticket.status] ?? ticket.status}
        </Text>
        <Text style={styles.meta}>
          Catégorie : {ticket.category} · Dernière mise à jour :{' '}
          {new Date(ticket.updated_at).toLocaleString('fr-FR')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  notification: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#f0f4f8',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
