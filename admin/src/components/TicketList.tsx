'use client';

import { useEffect, useState } from 'react';
import type { Ticket, TicketStatus } from '@/types/tickets';
import { fetchTickets, updateTicketStatus } from '@/lib/api';

const STATUS_LABELS: Record<TicketStatus, string> = {
  created: 'Créé',
  in_progress: 'En cours',
  resolved: 'Résolu',
};

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    if (ticket.status === newStatus) return;
    setUpdatingId(ticket.id);
    try {
      const updated = await updateTicketStatus(ticket.id, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-8 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        Chargement des tickets…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
        <p className="font-medium">Erreur</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={loadTickets}
          className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-8 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        Aucun ticket pour le moment.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                ID
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Logement
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Catégorie
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Statut
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Mis à jour
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {ticket.id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                  {ticket.listing_id}
                </td>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                  {ticket.category}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      handleStatusChange(ticket, e.target.value as TicketStatus)
                    }
                    disabled={updatingId === ticket.id}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {(['created', 'in_progress', 'resolved'] as const).map(
                      (s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      )
                    )}
                  </select>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {formatDate(ticket.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
