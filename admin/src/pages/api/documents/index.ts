/**
 * GET  /api/documents  → รายการเอกสารทั้งหมด (JSON)
 * POST /api/documents  → เพิ่มเอกสารใหม่
 */
import type { APIRoute } from 'astro';
import { getAllDocuments, createDocument } from '../../../lib/db';

export const GET: APIRoute = async () => {
  const docs = await getAllDocuments();
  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  // Validate required fields
  const { indicator_id, title, url, academic_year, doc_type, sort_order } = body;
  if (!indicator_id || !title?.trim() || !url?.trim()) {
    return new Response(JSON.stringify({ error: 'กรุณากรอก indicator_id, title และ url' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  // ตรวจสอบ URL format (ต้องเป็น https://)
  try { new URL(url); } catch {
    return new Response(JSON.stringify({ error: 'URL ไม่ถูกต้อง' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const doc = await createDocument({
    indicator_id: Number(indicator_id),
    title: title.trim(),
    url: url.trim(),
    academic_year: academic_year || '2567',
    doc_type: doc_type || 'เอกสาร',
    sort_order: Number(sort_order) || 0,
  });

  return new Response(JSON.stringify(doc), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
};
