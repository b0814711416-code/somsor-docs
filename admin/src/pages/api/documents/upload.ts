/**
 * POST /api/documents/upload
 * รับ multipart/form-data: file, indicator_id, doc_type, academic_year, sort_order
 * → อัปโหลดขึ้น Google Drive → บันทึก URL ลง DB → return document
 */
import type { APIRoute } from 'astro';
import { getIndicatorById, createDocument, parseTags } from '../../../lib/db';
import { uploadDocumentFile } from '../../../lib/google-drive';

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'ไม่สามารถอ่านข้อมูลได้' }, 400);
  }

  const file = formData.get('file') as File | null;
  const indicatorId = Number(formData.get('indicator_id'));
  const level = (formData.get('level') as string) || 'basic';
  const docType = (formData.get('doc_type') as string) || 'เอกสาร';
  const academicYear = (formData.get('academic_year') as string) || '2567';
  const sortOrder = Number(formData.get('sort_order')) || 0;
  const title = (formData.get('title') as string)?.trim();
  const tags = parseTags(formData.get('tags'));

  if (!file || file.size === 0) return json({ error: 'กรุณาเลือกไฟล์' }, 400);
  if (!indicatorId) return json({ error: 'กรุณาเลือกตัวชี้วัด' }, 400);
  if (!title) return json({ error: 'กรุณากรอกชื่อเอกสาร' }, 400);

  // ตรวจขนาดไฟล์ ≤ 50 MB
  if (file.size > 50 * 1024 * 1024) {
    return json({ error: 'ไฟล์ต้องมีขนาดไม่เกิน 50 MB' }, 400);
  }

  const indicator = await getIndicatorById(indicatorId);
  if (!indicator) return json({ error: 'ไม่พบตัวชี้วัดที่เลือก' }, 404);

  let fileId: string;
  let webViewLink: string;
  try {
    ({ fileId, webViewLink } = await uploadDocumentFile(
      file,
      level as 'basic' | 'early',
      indicator.code,
      indicator.name,
    ));
  } catch (err: any) {
    console.error('Drive upload error:', err);
    return json({ error: `อัปโหลดไม่สำเร็จ: ${err.message}` }, 500);
  }

  const doc = await createDocument({
    indicator_id: indicatorId,
    title,
    url: webViewLink,
    academic_year: academicYear,
    doc_type: docType,
    sort_order: sortOrder,
    tags,
  });

  return json({ ...doc, drive_file_id: fileId }, 201);
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
