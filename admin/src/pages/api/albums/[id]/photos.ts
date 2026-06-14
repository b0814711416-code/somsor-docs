/**
 * POST /api/albums/:id/photos — อัปโหลดรูปใหม่เข้า album
 * รับ multipart/form-data: photo (File)
 */
import type { APIRoute } from 'astro';
import { countPhotos, addPhoto, sql } from '../../../../lib/db';
import { uploadPhotoToDrive } from '../../../../lib/google-drive';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const MAX_PHOTOS = 10;

export const POST: APIRoute = async ({ params, request }) => {
  const albumId = Number(params.id);
  if (!albumId) return json({ error: 'id ไม่ถูกต้อง' }, 400);

  // ดึง folder_id ของ album
  const rows = await sql`SELECT * FROM indicator_albums WHERE id = ${albumId}` as any[];
  if (!rows.length) return json({ error: 'ไม่พบ album' }, 404);
  const album = rows[0];

  const count = await countPhotos(albumId);
  if (count >= MAX_PHOTOS) {
    return json({ error: `คลังภาพนี้มีรูปครบ ${MAX_PHOTOS} รูปแล้ว` }, 422);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'ไม่สามารถอ่านไฟล์ได้' }, 400);
  }

  const photo = formData.get('photo') as File | null;
  if (!photo || !photo.size) return json({ error: 'กรุณาเลือกไฟล์รูปภาพ' }, 400);

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(photo.type)) return json({ error: 'รองรับเฉพาะ JPG, PNG, WebP, GIF' }, 400);

  if (photo.size > 20 * 1024 * 1024) return json({ error: 'รูปภาพต้องไม่เกิน 20 MB' }, 400);

  try {
    const { fileId, thumbnailUrl } = await uploadPhotoToDrive(photo, album.folder_id);
    const saved = await addPhoto({
      album_id: albumId,
      file_id: fileId,
      url: thumbnailUrl,
      sort_order: count,
    });
    return json(saved, 201);
  } catch (e: any) {
    return json({ error: e.message ?? 'อัปโหลดล้มเหลว' }, 500);
  }
};
