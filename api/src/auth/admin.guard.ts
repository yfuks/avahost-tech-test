import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export interface AdminUserPayload {
  id: string;
  email?: string;
  app_metadata?: { role?: string };
}

/**
 * Guard that requires a valid Supabase JWT with app_metadata.role = 'admin'
 * for admin-only ticket routes. Validates the token by calling Supabase Auth API
 * (no JWT secret needed; works with any Supabase signing key setup).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!this.requiresAdmin(request)) {
      return true;
    }

    const token = this.getBearerToken(request);
    const url = process.env.SUPABASE_URL;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !apiKey) {
      throw new UnauthorizedException(
        'Configuration manquante (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      );
    }

    if (!token) {
      throw new UnauthorizedException('Token d’authentification requis');
    }

    try {
      const res = await fetch(`${url}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: apiKey,
        },
      });
      if (!res.ok) {
        throw new UnauthorizedException('Token invalide ou expiré');
      }
      const body = (await res.json()) as
        | AdminUserPayload
        | { user: AdminUserPayload };
      const user = 'user' in body ? body.user : body;
      const role = user?.app_metadata?.role;
      if (role !== 'admin') {
        throw new UnauthorizedException('Accès réservé aux administrateurs');
      }
      (request as Request & { adminUser?: AdminUserPayload }).adminUser = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  private requiresAdmin(request: Request): boolean {
    const path = request.path;
    const method = request.method;

    if (method === 'GET' && path === '/tickets') {
      const conversationId = (request.query.conversation_id as string)?.trim();
      const guestDeviceId = (request.query.guest_device_id as string)?.trim();
      if (conversationId || guestDeviceId) return false;
      return true;
    }

    if (
      method === 'GET' &&
      /^\/tickets\/[^/]+\/conversation-messages$/.test(path)
    ) {
      return true;
    }

    if (method === 'PATCH' && /^\/tickets\/[^/]+$/.test(path)) {
      return true;
    }

    return false;
  }

  private getBearerToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return auth.slice(7).trim() || null;
  }
}
