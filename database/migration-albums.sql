-- ============================================================
-- Migration: เพิ่มระบบคลังภาพ ต่อตัวชี้วัด
-- รันครั้งเดียวใน Neon SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS indicator_albums (
  id           SERIAL       PRIMARY KEY,
  indicator_id INTEGER      NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  folder_id    TEXT         NOT NULL,   -- Google Drive folder ID
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicator_photos (
  id          SERIAL       PRIMARY KEY,
  album_id    INTEGER      NOT NULL REFERENCES indicator_albums(id) ON DELETE CASCADE,
  file_id     TEXT         NOT NULL,   -- Google Drive file ID
  url         TEXT         NOT NULL,   -- webViewLink
  sort_order  INTEGER      DEFAULT 0,
  uploaded_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_albums_indicator ON indicator_albums(indicator_id);
CREATE INDEX IF NOT EXISTS idx_photos_album     ON indicator_photos(album_id);
