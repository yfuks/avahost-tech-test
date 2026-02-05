'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppUser } from '@/types/user';
import { fetchUserRole } from '@/lib/user';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type UserContextValue = {
  user: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [role, setRole] = useState<AppUser['role'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setRole(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    const supabase = createClient();
    fetchUserRole(supabase, session.user.id).then((r) => {
      if (!cancelled) {
        setRole(r);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const user: AppUser | null =
    role === null
      ? null
      : { role, email: session?.user?.email };

  const value: UserContextValue = {
    user,
    isAdmin: role === 'admin',
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
