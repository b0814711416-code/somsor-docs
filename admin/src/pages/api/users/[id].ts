import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getSession } from '../../../lib/auth';
import { updateAdminUser, deleteAdminUser } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  const data = await request.json();

  const updateData: { display_name?: string; is_active?: boolean; password_hash?: string } = {};

  if (data.display_name !== undefined) updateData.display_name = data.display_name;
  if (data.is_active    !== undefined) updateData.is_active    = Boolean(data.is_active);

  if (data.password && data.password.length > 0) {
    if (data.password.length < 6) {
      return new Response(JSON.stringify({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }), { status: 400 });
    }
    updateData.password_hash = await bcrypt.hash(data.password, 10);
  }

  const user = await updateAdminUser(id, updateData);
  if (!user) return new Response(JSON.stringify({ error: 'ไม่พบผู้ใช้งาน' }), { status: 404 });
  return new Response(JSON.stringify(user), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  const session = await getSession(request);

  if (session?.userId === id) {
    return new Response(JSON.stringify({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' }), { status: 400 });
  }

  const ok = await deleteAdminUser(id);
  if (!ok) return new Response(JSON.stringify({ error: 'ไม่พบผู้ใช้งาน' }), { status: 404 });
  return new Response(JSON.stringify({ ok: true }));
};
