import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/types/user';

export type UserRow = {
  id: string;
  role: UserRole;
  created_at: string;
};

/**
 * Fetches the app user role from public.users (single source of truth).
 * Auth = Supabase session; User = row in public.users.
 */
export async function fetchUserRole(
  supabase: SupabaseClient,
  authUserId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUserId)
    .maybeSingle();
  if (error || !data?.role) return null;
  if (data.role === 'admin' || data.role === 'user') return data.role;
  return null;
}

export function isAdminRole(role: UserRole | null): role is 'admin' {
  return role === 'admin';
}
