/**
 * DELETE /api/albums/:id — ลบ album (และรูปภาพทั้งหมดผ่าน CASCADE)
 */
import type { APIRoute } from 'astro';
import { deleteAlbum } from '../../../lib/db';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!id) return json({ error: 'id ไม่ถูกต้อง' }, 400);
  const ok = await deleteAlbum(id);
  if (!ok) return json({ error: 'ไม่พบ album' }, 404);
  return json({ success: true });
};
