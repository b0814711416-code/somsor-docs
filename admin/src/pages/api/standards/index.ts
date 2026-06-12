import type { APIRoute } from 'astro';
import { getAllStandards, createStandard } from '../../../lib/db';

export const GET: APIRoute = async () => {
  const standards = await getAllStandards();
  return new Response(JSON.stringify(standards), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code, name, description, icon, color, sort_order, education_level } = body;

    if (!code || !name || !education_level) {
      return new Response(JSON.stringify({ error: 'กรุณากรอก รหัส, ชื่อ และระดับการศึกษา' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const standard = await createStandard({
      code: String(code).trim(),
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      icon: String(icon || '📌').trim(),
      color: String(color || 'blue').trim(),
      sort_order: Number(sort_order) || 0,
      education_level: String(education_level),
    });

    return new Response(JSON.stringify(standard), {
      status: 201, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
