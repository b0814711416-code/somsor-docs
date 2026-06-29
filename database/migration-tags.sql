-- ============================================================
-- Migration: เพิ่มระบบ tag (ป้ายกำกับ) ให้เอกสาร
-- รันครั้งเดียวใน Neon SQL Editor
-- ============================================================

-- คอลัมน์ tags เก็บเป็น array ของข้อความ เช่น {"สมศ.","ปีการศึกษา 2567","สำคัญ"}
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- GIN index เพื่อให้ค้นหา/กรองด้วย tag ได้เร็ว (รองรับ operator @> และ &&)
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN (tags);
