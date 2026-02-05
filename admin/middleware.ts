import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { fetchUserRole } from '@/lib/user';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return response;
  }

  // Auth: Supabase session only
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User: role from public.users (separate from auth)
  const role = user ? await fetchUserRole(supabase, user.id) : null;
  const isAdmin = role === 'admin';
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!user && !isLoginPage) {
    const redirect = new URL('/login', request.url);
    return NextResponse.redirect(redirect);
  }
  if (user && !isAdmin && !isLoginPage) {
    const redirect = new URL('/login', request.url);
    redirect.searchParams.set('error', 'not_admin');
    return NextResponse.redirect(redirect);
  }
  if (user && isAdmin && isLoginPage) {
    const redirect = new URL('/', request.url);
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|ico|jpg|jpeg|gif|webp)$).*)'],
};
