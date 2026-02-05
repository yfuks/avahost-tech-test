import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { getTicket } from '../api/tickets';
import type { TicketStatus as TicketStatusType } from '../types/api';

const statusLabels: Record<TicketStatusType, string> = {
  created: 'Créé',
  in_progress: 'En cours',
  resolved: 'Résolu',
};

interface TicketStatusProps {
  ticketId: string;
}

export function TicketStatus({ ticketId }: TicketStatusProps) {
  const { data: ticket } = useSuspenseQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket(ticketId),
    staleTime: 10_000,
  });

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f4f8',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
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
