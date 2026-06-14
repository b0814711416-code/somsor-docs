/**
 * GET  /api/albums?indicator_id=N  — รายการ album
 * POST /api/albums                 — สร้าง album ใหม่
 */
import type { APIRoute } from 'astro';
import { getAlbumsByIndicator, createAlbum, getIndicatorById } from '../../../lib/db';
import { getOrCreateAlbumFolder } from '../../../lib/google-drive';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ url }) => {
  const indicatorId = Number(url.searchParams.get('indicator_id'));
  if (!indicatorId) return json({ error: 'indicator_id required' }, 400);
  const albums = await getAlbumsByIndicator(indicatorId);
  return json(albums);
};

export const POST: APIRoute = async ({ request }) => {
  let body: { indicator_id: number; name: string; level: 'basic' | 'early' };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'ข้อมูลไม่ถูกต้อง' }, 400);
  }

  const { indicator_id, name, level } = body;
  if (!indicator_id || !name?.trim() || !level) {
    return json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, 400);
  }

  const indicator = await getIndicatorById(indicator_id);
  if (!indicator) return json({ error: 'ไม่พบตัวชี้วัด' }, 404);

  try {
    const folderId = await getOrCreateAlbumFolder(level, indicator.code, indicator.name, name.trim());
    const album = await createAlbum({ indicator_id, name: name.trim(), folder_id: folderId });
    return json(album, 201);
  } catch (e: any) {
    return json({ error: e.message ?? 'เกิดข้อผิดพลาด' }, 500);
  }
};
