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
  education_level: string;
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
  education_level?: string;
}

export interface AdminUser {
  id: number; email: string; display_name: string | null;
  is_active: boolean; last_login_at: string | null; role: string;
}

// --------- Standards ---------

export async function getAllStandards(): Promise<Standard[]> {
  return await sql`SELECT * FROM standards ORDER BY education_level, sort_order, code` as Standard[];
}

export async function getStandardById(id: number): Promise<Standard | null> {
  const rows = await sql`SELECT * FROM standards WHERE id = ${id}` as Standard[];
  return rows[0] ?? null;
}

export async function createStandard(data: {
  code: string; name: string; description?: string;
  icon: string; color: string; sort_order: number; education_level: string;
}): Promise<Standard> {
  const rows = await sql`
    INSERT INTO standards (code, name, description, icon, color, sort_order, education_level)
    VALUES (${data.code}, ${data.name}, ${data.description ?? null},
            ${data.icon}, ${data.color}, ${data.sort_order}, ${data.education_level})
    RETURNING *
  ` as Standard[];
  return rows[0];
}

export async function updateStandard(id: number, data: {
  code?: string; name?: string; description?: string;
  icon?: string; color?: string; sort_order?: number; education_level?: string;
}): Promise<Standard | null> {
  const rows = await sql`
    UPDATE standards SET
      code            = COALESCE(${data.code            ?? null}, code),
      name            = COALESCE(${data.name            ?? null}, name),
      description     = COALESCE(${data.description     ?? null}, description),
      icon            = COALESCE(${data.icon            ?? null}, icon),
      color           = COALESCE(${data.color           ?? null}, color),
      sort_order      = COALESCE(${data.sort_order      ?? null}, sort_order),
      education_level = COALESCE(${data.education_level ?? null}, education_level)
    WHERE id = ${id}
    RETURNING *
  ` as Standard[];
  return rows[0] ?? null;
}

export async function deleteStandard(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM standards WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
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

export async function getIndicatorById(id: number): Promise<Indicator | null> {
  const rows = await sql`
    SELECT i.*, s.name AS standard_name
    FROM indicators i
    JOIN standards s ON s.id = i.standard_id
    WHERE i.id = ${id}
  ` as Indicator[];
  return rows[0] ?? null;
}

export async function createIndicator(data: {
  standard_id: number; code: string; name: string;
  description?: string; sort_order: number;
}): Promise<Indicator> {
  const rows = await sql`
    INSERT INTO indicators (standard_id, code, name, description, sort_order)
    VALUES (${data.standard_id}, ${data.code}, ${data.name},
            ${data.description ?? null}, ${data.sort_order})
    RETURNING *
  ` as Indicator[];
  return rows[0];
}

export async function updateIndicator(id: number, data: {
  standard_id?: number; code?: string; name?: string;
  description?: string; sort_order?: number;
}): Promise<Indicator | null> {
  const rows = await sql`
    UPDATE indicators SET
      standard_id = COALESCE(${data.standard_id ?? null}, standard_id),
      code        = COALESCE(${data.code        ?? null}, code),
      name        = COALESCE(${data.name        ?? null}, name),
      description = COALESCE(${data.description ?? null}, description),
      sort_order  = COALESCE(${data.sort_order  ?? null}, sort_order)
    WHERE id = ${id}
    RETURNING *
  ` as Indicator[];
  return rows[0] ?? null;
}

export async function deleteIndicator(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM indicators WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
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
           s.name  AS standard_name,
           s.education_level
    FROM documents d
    JOIN indicators i ON i.id = d.indicator_id
    JOIN standards  s ON s.id = i.standard_id
    ORDER BY s.education_level, s.sort_order, i.sort_order, d.sort_order, d.id
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

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  return await sql`
    SELECT id, email, display_name, is_active, last_login_at, role
    FROM admin_users ORDER BY id
  ` as AdminUser[];
}

export async function getAdminUserById(id: number): Promise<AdminUser | null> {
  const rows = await sql`
    SELECT id, email, display_name, is_active, last_login_at, role
    FROM admin_users WHERE id = ${id}
  ` as AdminUser[];
  return rows[0] ?? null;
}

export async function createAdminUser(data: {
  email: string; password_hash: string; display_name?: string; role?: string;
}): Promise<AdminUser> {
  const rows = await sql`
    INSERT INTO admin_users (email, password_hash, display_name, role)
    VALUES (${data.email}, ${data.password_hash}, ${data.display_name ?? null}, ${data.role ?? 'teacher'})
    RETURNING id, email, display_name, is_active, last_login_at, role
  ` as AdminUser[];
  return rows[0];
}

export async function updateAdminUser(id: number, data: {
  display_name?: string; is_active?: boolean; password_hash?: string; role?: string;
}): Promise<AdminUser | null> {
  const rows = await sql`
    UPDATE admin_users SET
      display_name  = COALESCE(${data.display_name  ?? null}, display_name),
      is_active     = COALESCE(${data.is_active     ?? null}, is_active),
      password_hash = COALESCE(${data.password_hash ?? null}, password_hash),
      role          = COALESCE(${data.role          ?? null}, role)
    WHERE id = ${id}
    RETURNING id, email, display_name, is_active, last_login_at, role
  ` as AdminUser[];
  return rows[0] ?? null;
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM admin_users WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
