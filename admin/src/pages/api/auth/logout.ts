/**
 * POST /api/auth/logout
 * ล้าง session cookie → redirect ไปหน้า login
 */
import type { APIRoute } from 'astro';
import { makeLogoutCookie } from '../../../lib/auth';

export const POST: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/login',
      'Set-Cookie': makeLogoutCookie(),
    },
  });
};
