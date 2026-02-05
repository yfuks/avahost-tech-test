'use client';

import { useAuth } from '@/contexts/AuthContext';

export function AdminHeader() {
  const { session, signOut } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Back office — Gestion des tickets
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Consultez les tickets et modifiez leur statut (créé → en cours → résolu).
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session?.user?.email && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {session.user.email}
            </span>
          )}
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
