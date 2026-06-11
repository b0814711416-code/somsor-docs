/**
 * Neon Serverless connection สำหรับ Admin Panel
 * ใช้งานทั้ง query อ่าน และ CRUD
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.DATABASE_URL);
export { sql };

// --------- Types ---------

export interface Standard {
  id: number; code: string; name: string;
  description: string | null; icon: string;
  color: string; sort_order: number;
}

export interface Indicator {
  id: number; standard_id: number; code: string;
  name: string; description: string | null; sort_order: number;
  standard_name?: string;
}

export interface Document {
  id: number; indicator_id: number; title: string; url: string;
  academic_year: string; doc_type: string;
  is_active: boolean; sort_order: number;
  created_at: string; updated_at: string;
  indicator_code?: string; indicator_name?: string;
  standard_code?: string; standard_name?: string;
}

export interface AdminUser {
  id: number; email: string; display_name: string | null;
  is_active: boolean; last_login_at: string | null;
}

// --------- Standards ---------

export async function getAllStandards(): Promise<Standard[]> {
  return await sql`SELECT * FROM standards ORDER BY sort_order, code` as Standard[];
}

// --------- Indicators ---------

export async function getAllIndicators(): Promise<Indicator[]> {
  return await sql`
    SELECT i.*, s.name AS standard_name
    FROM indicators i
    JOIN standards s ON s.id = i.standard_id
    ORDER BY s.sort_order, i.sort_order, i.code
  ` as Indicator[];
}

export async function getIndicatorsByStandard(standardId: number): Promise<Indicator[]> {
  return await sql`
    SELECT * FROM indicators WHERE standard_id = ${standardId}
    ORDER BY sort_order, code
  ` as Indicator[];
}

// --------- Documents ---------

export async function getAllDocuments(): Promise<Document[]> {
  return await sql`
    SELECT d.*,
           i.code  AS indicator_code,
           i.name  AS indicator_name,
           s.code  AS standard_code,
           s.name  AS standard_name
    FROM documents d
    JOIN indicators i ON i.id = d.indicator_id
    JOIN standards  s ON s.id = i.standard_id
    ORDER BY s.sort_order, i.sort_order, d.sort_order, d.id
  ` as Document[];
}

export async function getDocumentById(id: number): Promise<Document | null> {
  const rows = await sql`
    SELECT d.*,
           i.code AS indicator_code, i.name AS indicator_name,
           s.code AS standard_code,  s.name AS standard_name
    FROM documents d
    JOIN indicators i ON i.id = d.indicator_id
    JOIN standards  s ON s.id = i.standard_id
    WHERE d.id = ${id}
  ` as Document[];
  return rows[0] ?? null;
}

export async function createDocument(data: {
  indicator_id: number; title: string; url: string;
  academic_year: string; doc_type: string; sort_order: number;
}): Promise<Document> {
  const rows = await sql`
    INSERT INTO documents (indicator_id, title, url, academic_year, doc_type, sort_order)
    VALUES (${data.indicator_id}, ${data.title}, ${data.url},
            ${data.academic_year}, ${data.doc_type}, ${data.sort_order})
    RETURNING *
  ` as Document[];
  return rows[0];
}

export async function updateDocument(id: number, data: {
  indicator_id?: number; title?: string; url?: string;
  academic_year?: string; doc_type?: string;
  is_active?: boolean; sort_order?: number;
}): Promise<Document | null> {
  const rows = await sql`
    UPDATE documents
    SET indicator_id  = COALESCE(${data.indicator_id  ?? null}, indicator_id),
        title         = COALESCE(${data.title         ?? null}, title),
        url           = COALESCE(${data.url           ?? null}, url),
        academic_year = COALESCE(${data.academic_year ?? null}, academic_year),
        doc_type      = COALESCE(${data.doc_type      ?? null}, doc_type),
        is_active     = COALESCE(${data.is_active     ?? null}, is_active),
        sort_order    = COALESCE(${data.sort_order    ?? null}, sort_order)
    WHERE id = ${id}
    RETURNING *
  ` as Document[];
  return rows[0] ?? null;
}

export async function deleteDocument(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM documents WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// --------- Admin Users ---------

export async function getAdminByEmail(email: string) {
  const rows = await sql`
    SELECT * FROM admin_users WHERE email = ${email} AND is_active = TRUE LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateLastLogin(id: number) {
  await sql`UPDATE admin_users SET last_login_at = NOW() WHERE id = ${id}`;
}
