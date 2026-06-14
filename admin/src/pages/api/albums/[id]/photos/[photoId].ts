/**
 * DELETE /api/albums/:id/photos/:photoId — ลบรูปภาพ
 */
import type { APIRoute } from 'astro';
import { deletePhoto } from '../../../../../lib/db';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const DELETE: APIRoute = async ({ params }) => {
  const photoId = Number(params.photoId);
  if (!photoId) return json({ error: 'photoId ไม่ถูกต้อง' }, 400);
  const ok = await deletePhoto(photoId);
  if (!ok) return json({ error: 'ไม่พบรูปภาพ' }, 404);
  return json({ success: true });
};
