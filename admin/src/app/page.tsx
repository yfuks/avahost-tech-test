import { TicketList } from '@/components/TicketList';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Back office — Gestion des tickets
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Consultez les tickets et modifiez leur statut (créé → en cours → résolu).
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <TicketList />
      </main>
    </div>
  );
}
