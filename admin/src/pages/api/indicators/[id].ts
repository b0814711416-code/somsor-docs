import type { APIRoute } from 'astro';
import { updateIndicator, deleteIndicator } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  try {
    const body = await request.json();
    const indicator = await updateIndicator(id, body);
    if (!indicator) {
      return new Response(JSON.stringify({ error: 'ไม่พบตัวบ่งชี้' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(indicator), {
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
    const ok = await deleteIndicator(id);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'ไม่พบตัวบ่งชี้' }), {
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
