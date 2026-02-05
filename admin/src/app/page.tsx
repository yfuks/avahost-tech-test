import { AdminHeader } from '@/components/AdminHeader';
import { TicketList } from '@/components/TicketList';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <TicketList />
      </main>
    </div>
  );
}
