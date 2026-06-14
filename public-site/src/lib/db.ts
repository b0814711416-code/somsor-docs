/**
 * Neon Serverless PostgreSQL connection
 * ใช้สำหรับดึงข้อมูลตอน build time ผ่าน GitHub Actions
 *
 * ตัวแปร DATABASE_URL ตั้งค่าใน:
 *   - Local:  ไฟล์ .env ที่ root ของ public-site/
 *   - CI/CD:  GitHub Actions Secrets ชื่อ DATABASE_URL
 */
import { neon } from '@neondatabase/serverless';

// สร้าง SQL client — neon() คืนค่า template tag function
const sql = neon(import.meta.env.DATABASE_URL);

// --------- Types ---------

export interface Standard {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  education_level: string;
}

export interface Indicator {
  id: number;
  standard_id: number;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Document {
  id: number;
  indicator_id: number;
  title: string;
  url: string;
  academic_year: string;
  doc_type: string;
  sort_order: number;
}

export interface Photo {
  id: number;
  file_id: string;
  url: string;
  sort_order: number;
}

export interface Album {
  id: number;
  name: string;
  photos: Photo[];
}

// --------- Query Functions ---------

/** ดึงมาตรฐานทั้งหมด เรียงตาม sort_order */
export async function getAllStandards(): Promise<Standard[]> {
  return await sql`
    SELECT id, code, name, description, icon, color, sort_order
    FROM standards
    ORDER BY sort_order ASC, code ASC
  ` as Standard[];
}

/** ดึงข้อมูลทุกอย่างแยกตามระดับการศึกษา */
export async function getFullDataByLevel(level: string) {
  const standards = await sql`
    SELECT s.id, s.code, s.name, s.description, s.icon, s.color, s.sort_order, s.education_level,
           json_agg(
             json_build_object(
               'id', i.id,
               'code', i.code,
               'name', i.name,
               'description', i.description,
               'sort_order', i.sort_order,
               'documents', (
                 SELECT json_agg(
                   json_build_object(
                     'id', d.id,
                     'title', d.title,
                     'url', d.url,
                     'academic_year', d.academic_year,
                     'doc_type', d.doc_type
                   ) ORDER BY d.sort_order, d.id
                 )
                 FROM documents d
                 WHERE d.indicator_id = i.id AND d.is_active = TRUE
               )
             ) ORDER BY i.sort_order, i.code
           ) AS indicators
    FROM standards s
    LEFT JOIN indicators i ON i.standard_id = s.id
    WHERE s.education_level = ${level}
    GROUP BY s.id
    ORDER BY s.sort_order, s.code
  `;
  return standards as Array<Standard & { indicators: Array<Indicator & { documents: Document[] }> }>;
}

/** ดึงข้อมูลทุกอย่างในคราวเดียว (สำหรับหน้า index) */
export async function getFullData() {
  const standards = await sql`
    SELECT s.id, s.code, s.name, s.description, s.icon, s.color, s.sort_order, s.education_level,
           json_agg(
             json_build_object(
               'id', i.id,
               'code', i.code,
               'name', i.name,
               'description', i.description,
               'sort_order', i.sort_order,
               'documents', (
                 SELECT json_agg(
                   json_build_object(
                     'id', d.id,
                     'title', d.title,
                     'url', d.url,
                     'academic_year', d.academic_year,
                     'doc_type', d.doc_type
                   ) ORDER BY d.sort_order, d.id
                 )
                 FROM documents d
                 WHERE d.indicator_id = i.id AND d.is_active = TRUE
               )
             ) ORDER BY i.sort_order, i.code
           ) AS indicators
    FROM standards s
    LEFT JOIN indicators i ON i.standard_id = s.id
    GROUP BY s.id
    ORDER BY s.sort_order, s.code
  `;

  return standards as Array<Standard & { indicators: Array<Indicator & { documents: Document[] }> }>;
}

/** ดึงข้อมูล standard เดี่ยว พร้อม indicators และ documents */
export async function getStandardByCode(code: string) {
  const rows = await sql`
    SELECT s.id, s.code, s.name, s.description, s.icon, s.color, s.education_level
    FROM standards s
    WHERE s.code = ${code}
    LIMIT 1
  `;
  if (rows.length === 0) return null;

  const standard = rows[0] as Standard;

  const indicators = await sql`
    SELECT i.id, i.code, i.name, i.description
    FROM indicators i
    WHERE i.standard_id = ${standard.id}
    ORDER BY i.sort_order, i.code
  ` as Indicator[];

  for (const indicator of indicators) {
    const docs = await sql`
      SELECT id, title, url, academic_year, doc_type
      FROM documents
      WHERE indicator_id = ${indicator.id} AND is_active = TRUE
      ORDER BY sort_order, id
    ` as Document[];
    (indicator as any).documents = docs;

    const albumRows = await sql`
      SELECT id, name FROM indicator_albums
      WHERE indicator_id = ${indicator.id}
      ORDER BY created_at ASC
    ` as Album[];

    for (const album of albumRows) {
      album.photos = await sql`
        SELECT id, file_id, url, sort_order FROM indicator_photos
        WHERE album_id = ${album.id}
        ORDER BY sort_order, uploaded_at
      ` as Photo[];
    }
    (indicator as any).albums = albumRows;
  }

  return { ...standard, indicators };
}

/** ดึงรหัส standard ทั้งหมด (สำหรับ getStaticPaths) */
export async function getAllStandardCodes(): Promise<string[]> {
  const rows = await sql`SELECT code FROM standards ORDER BY sort_order`;
  return rows.map((r: any) => r.code);
}

/** ดึงสถิติแยกตามระดับ (สำหรับหน้า landing) */
export async function getLevelStats(): Promise<{
  basic: { standards: number; indicators: number; documents: number };
  early: { standards: number; indicators: number; documents: number };
}> {
  const rows = await sql`
    SELECT
      s.education_level,
      COUNT(DISTINCT s.id)  AS std_count,
      COUNT(DISTINCT i.id)  AS ind_count,
      COUNT(DISTINCT d.id)  AS doc_count
    FROM standards s
    LEFT JOIN indicators i ON i.standard_id = s.id
    LEFT JOIN documents  d ON d.indicator_id = i.id AND d.is_active = TRUE
    GROUP BY s.education_level
  `;
  const basic = rows.find((r: any) => r.education_level === 'basic');
  const early = rows.find((r: any) => r.education_level === 'early');
  return {
    basic: { standards: Number(basic?.std_count ?? 0), indicators: Number(basic?.ind_count ?? 0), documents: Number(basic?.doc_count ?? 0) },
    early: { standards: Number(early?.std_count ?? 0), indicators: Number(early?.ind_count ?? 0), documents: Number(early?.doc_count ?? 0) },
  };
}
