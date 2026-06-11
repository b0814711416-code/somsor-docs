/**
 * auth.ts — JWT session helpers
 * ใช้ jose (pure JS, ทำงานใน Vercel Edge ได้) แทน jsonwebtoken
 */
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.JWT_SECRET || 'change-this-secret-in-production'
);
const COOKIE_NAME = 'admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 ชั่วโมง

export interface SessionPayload {
  userId: number;
  email: string;
}

/** สร้าง JWT token */
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(JWT_SECRET);
}

/** ตรวจสอบ JWT token */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** อ่าน session จาก cookie ใน Request */
export async function getSession(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').filter(Boolean).map(c => {
      const [k, ...v] = c.split('=');
      return [k, v.join('=')];
    })
  );
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

/** สร้าง Set-Cookie header สำหรับ login */
export function makeLoginCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`;
}

/** สร้าง Set-Cookie header สำหรับ logout (expire ทันที) */
export function makeLogoutCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
