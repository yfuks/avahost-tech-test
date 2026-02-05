/**
 * User role in the app. Separate from auth (Supabase session).
 * Auth = who is logged in. User = what role they have (admin vs user).
 */
export type UserRole = 'user' | 'admin';

export type AppUser = {
  role: UserRole;
  email: string | undefined;
};
