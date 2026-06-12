import type { APIRoute } from 'astro';
import { updateStandard, deleteStandard } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  try {
    const body = await request.json();
    const standard = await updateStandard(id, body);
    if (!standard) {
      return new Response(JSON.stringify({ error: 'ไม่พบมาตรฐาน' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(standard), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  try {
    const ok = await deleteStandard(id);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'ไม่พบมาตรฐาน' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
