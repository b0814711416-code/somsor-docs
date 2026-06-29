-- ============================================================
-- ระบบจัดเก็บลิงก์เอกสาร สมศ. รอบห้า
-- Database Schema สำหรับ Neon.tech (PostgreSQL)
-- วิธีใช้: คัดลอกทั้งหมดไปรันใน Neon SQL Editor
-- ============================================================

-- ลบตารางเก่าก่อน (ถ้ามี) เพื่อ reset ใหม่
DROP TABLE IF EXISTS documents    CASCADE;
DROP TABLE IF EXISTS indicators   CASCADE;
DROP TABLE IF EXISTS standards    CASCADE;
DROP TABLE IF EXISTS admin_users  CASCADE;

-- ============================================================
-- ตาราง 1: standards — มาตรฐาน สมศ.
-- ============================================================
CREATE TABLE standards (
  id          SERIAL       PRIMARY KEY,
  code        VARCHAR(10)  NOT NULL UNIQUE,  -- รหัสมาตรฐาน เช่น "1", "2", "3"
  name        TEXT         NOT NULL,          -- ชื่อมาตรฐาน
  description TEXT,                           -- คำอธิบายมาตรฐาน
  icon        VARCHAR(10)  DEFAULT '📄',      -- emoji icon สำหรับแสดงผล
  color       VARCHAR(20)  DEFAULT 'blue',    -- สี theme (blue / green / purple / orange)
  sort_order  INTEGER      DEFAULT 0,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- ตาราง 2: indicators — ตัวบ่งชี้/ประเด็นพิจารณา
-- ============================================================
CREATE TABLE indicators (
  id          SERIAL       PRIMARY KEY,
  standard_id INTEGER      NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  code        VARCHAR(20)  NOT NULL,  -- รหัสตัวบ่งชี้ เช่น "1.1", "1.2"
  name        TEXT         NOT NULL,  -- ชื่อตัวบ่งชี้
  description TEXT,                   -- คำอธิบาย / เกณฑ์
  sort_order  INTEGER      DEFAULT 0,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- ตาราง 3: documents — เอกสารหลักฐาน พร้อมลิงก์ Google Drive
-- ============================================================
CREATE TABLE documents (
  id            SERIAL        PRIMARY KEY,
  indicator_id  INTEGER       NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  title         TEXT          NOT NULL,          -- ชื่อเอกสาร
  url           TEXT          NOT NULL,          -- ลิงก์ Google Drive
  academic_year VARCHAR(10)   DEFAULT '2567',    -- ปีการศึกษา เช่น "2567", "2566"
  doc_type      VARCHAR(50)   DEFAULT 'เอกสาร', -- ประเภท: รายงาน / คำสั่ง / ภาพถ่าย / สถิติ
  tags          TEXT[]        NOT NULL DEFAULT '{}', -- ป้ายกำกับ (tag) เช่น {"สมศ.","สำคัญ"}
  is_active     BOOLEAN       DEFAULT TRUE,       -- แสดง/ซ่อน
  sort_order    INTEGER       DEFAULT 0,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================
-- ตาราง 4: admin_users — ผู้ดูแลระบบ Admin
-- ============================================================
CREATE TABLE admin_users (
  id            SERIAL        PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,   -- bcrypt hash
  display_name  VARCHAR(100),
  is_active     BOOLEAN       DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================
-- Indexes — เพิ่มความเร็วในการ query
-- ============================================================
CREATE INDEX idx_indicators_standard_id ON indicators(standard_id);
CREATE INDEX idx_documents_indicator_id ON documents(indicator_id);
CREATE INDEX idx_documents_academic_year ON documents(academic_year);
CREATE INDEX idx_documents_is_active ON documents(is_active);
CREATE INDEX idx_documents_tags ON documents USING GIN (tags);

-- ============================================================
-- Trigger: อัปเดต updated_at อัตโนมัติเมื่อแก้ไข documents
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
