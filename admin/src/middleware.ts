/**
 * middleware.ts — Astro Middleware
 * ทำงานก่อนทุก request: ตรวจสอบว่า login แล้วหรือยัง
 * ถ้ายังไม่ login และไม่ใช่หน้า /login หรือ /api/auth/* → redirect ไป /login
 */
import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

// หน้า/route ที่ไม่ต้องการ auth
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/debug'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  // อนุญาต public paths ผ่านได้เลย
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return next();
  }

  // ตรวจ session จาก cookie
  const session = await getSession(context.request);

  if (!session) {
    // ยังไม่ login → redirect ไปหน้า login
    return context.redirect('/login');
  }

  // ผ่าน! ส่ง session ไปให้ทุก page ใช้งานผ่าน locals
  context.locals.session = session;
  return next();
});
