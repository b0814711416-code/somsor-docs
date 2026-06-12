import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getSession } from '../../../lib/auth';
import { getAllAdminUsers, createAdminUser } from '../../../lib/db';

async function requireAdmin(request: Request) {
  const session = await getSession(request);
  return session?.role === 'admin' ? session : null;
}

export const GET: APIRoute = async ({ request }) => {
  if (!await requireAdmin(request)) {
    return new Response(JSON.stringify({ error: 'ไม่มีสิทธิ์' }), { status: 403 });
  }
  const users = await getAllAdminUsers();
  return new Response(JSON.stringify(users), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  if (!await requireAdmin(request)) {
    return new Response(JSON.stringify({ error: 'ไม่มีสิทธิ์' }), { status: 403 });
  }

  const data = await request.json();
  const { email, password, display_name, role } = data;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }), { status: 400 });
  }
  if (password.length < 6) {
    return new Response(JSON.stringify({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }), { status: 400 });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await createAdminUser({
      email: email.trim().toLowerCase(),
      password_hash,
      display_name: display_name || undefined,
      role: role === 'admin' ? 'admin' : 'teacher',
    });
    return new Response(JSON.stringify(user), { status: 201 });
  } catch (err: any) {
    if (err?.message?.includes('unique') || err?.message?.includes('duplicate')) {
      return new Response(JSON.stringify({ error: 'อีเมลนี้มีอยู่ในระบบแล้ว' }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาด' }), { status: 500 });
  }
};
