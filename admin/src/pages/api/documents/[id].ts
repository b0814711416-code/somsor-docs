/**
 * PUT    /api/documents/[id]  → แก้ไขเอกสาร
 * DELETE /api/documents/[id]  → ลบเอกสาร
 */
import type { APIRoute } from 'astro';
import { updateDocument, deleteDocument } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  if (!id) return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });

  let body: any;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }); }

  // ตรวจสอบ URL ถ้ามีการส่งมา
  if (body.url) {
    try { new URL(body.url); }
    catch { return new Response(JSON.stringify({ error: 'URL ไม่ถูกต้อง' }), { status: 400 }); }
  }

  const updated = await updateDocument(id, {
    indicator_id:  body.indicator_id  !== undefined ? Number(body.indicator_id) : undefined,
    title:         body.title?.trim()  || undefined,
    url:           body.url?.trim()    || undefined,
    academic_year: body.academic_year  || undefined,
    doc_type:      body.doc_type       || undefined,
    is_active:     body.is_active      !== undefined ? Boolean(body.is_active) : undefined,
    sort_order:    body.sort_order     !== undefined ? Number(body.sort_order) : undefined,
  });

  if (!updated) {
    return new Response(JSON.stringify({ error: 'ไม่พบเอกสาร' }), { status: 404 });
  }

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!id) return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });

  const deleted = await deleteDocument(id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'ไม่พบเอกสาร' }), { status: 404 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
