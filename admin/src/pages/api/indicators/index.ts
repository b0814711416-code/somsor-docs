import type { APIRoute } from 'astro';
import { getAllIndicators, createIndicator } from '../../../lib/db';

export const GET: APIRoute = async () => {
  const indicators = await getAllIndicators();
  return new Response(JSON.stringify(indicators), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { standard_id, code, name, description, sort_order } = body;

    if (!standard_id || !code || !name) {
      return new Response(JSON.stringify({ error: 'กรุณากรอก มาตรฐาน, รหัส และชื่อตัวบ่งชี้' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const indicator = await createIndicator({
      standard_id: Number(standard_id),
      code: String(code).trim(),
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      sort_order: Number(sort_order) || 0,
    });

    return new Response(JSON.stringify(indicator), {
      status: 201, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
