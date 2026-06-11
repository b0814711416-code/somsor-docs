-- ============================================================
-- ข้อมูลตัวอย่าง (Seed Data) — มาตรฐาน สมศ. รอบห้า
-- วิธีใช้: รันหลังจาก schema.sql แล้ว
-- ============================================================

-- ---- มาตรฐาน (Standards) ----
INSERT INTO standards (code, name, description, icon, color, sort_order) VALUES
  ('1', 'คุณภาพของผู้เรียน',
   'ผู้เรียนมีพัฒนาการที่ดี มีความรู้ความสามารถ ทักษะ และคุณลักษณะที่พึงประสงค์',
   '🎓', 'blue', 1),

  ('2', 'กระบวนการบริหารและการจัดการ',
   'สถานศึกษามีการบริหารจัดการที่มีประสิทธิภาพ มุ่งเน้นผลสัมฤทธิ์ของผู้เรียน',
   '⚙️', 'green', 2),

  ('3', 'กระบวนการจัดการเรียนการสอนที่เน้นผู้เรียนเป็นสำคัญ',
   'ครูจัดการเรียนรู้ที่เน้นผู้เรียนเป็นศูนย์กลาง มีการพัฒนาการสอนอย่างต่อเนื่อง',
   '📚', 'purple', 3);

-- ---- ตัวบ่งชี้ มาตรฐานที่ 1 ----
INSERT INTO indicators (standard_id, code, name, sort_order) VALUES
  (1, '1.1', 'ผลสัมฤทธิ์ทางวิชาการของผู้เรียน', 1),
  (1, '1.2', 'คุณลักษณะที่พึงประสงค์ของผู้เรียน', 2);

-- ---- ตัวบ่งชี้ มาตรฐานที่ 2 ----
INSERT INTO indicators (standard_id, code, name, sort_order) VALUES
  (2, '2.1', 'การบริหารจัดการสถานศึกษาของผู้บริหาร', 1),
  (2, '2.2', 'การจัดสรรทรัพยากรเพื่อสร้างห้องเรียนคุณภาพ', 2);

-- ---- ตัวบ่งชี้ มาตรฐานที่ 3 ----
INSERT INTO indicators (standard_id, code, name, sort_order) VALUES
  (3, '3.1', 'การจัดการเรียนรู้', 1),
  (3, '3.2', 'การสร้างนวัตกรรมการจัดการเรียนรู้', 2);

-- ---- เอกสารตัวอย่าง (ใส่ URL จริงของ Google Drive ภายหลัง) ----
INSERT INTO documents (indicator_id, title, url, academic_year, doc_type, sort_order) VALUES
  -- มาตรฐาน 1.1
  (1, 'รายงานผลสัมฤทธิ์ทางการเรียน ปีการศึกษา 2567',
   'https://drive.google.com/file/d/EXAMPLE_ID_1/view', '2567', 'รายงาน', 1),
  (1, 'สถิติผลการสอบ O-NET ปีการศึกษา 2567',
   'https://drive.google.com/file/d/EXAMPLE_ID_2/view', '2567', 'สถิติ', 2),
  (1, 'รายงานผลสัมฤทธิ์ทางการเรียน ปีการศึกษา 2566',
   'https://drive.google.com/file/d/EXAMPLE_ID_3/view', '2566', 'รายงาน', 3),

  -- มาตรฐาน 1.2
  (2, 'รายงานการประเมินคุณลักษณะอันพึงประสงค์',
   'https://drive.google.com/file/d/EXAMPLE_ID_4/view', '2567', 'รายงาน', 1),
  (2, 'สรุปกิจกรรมพัฒนาคุณธรรมจริยธรรม',
   'https://drive.google.com/file/d/EXAMPLE_ID_5/view', '2567', 'สรุป', 2),

  -- มาตรฐาน 2.1
  (3, 'แผนพัฒนาคุณภาพการศึกษา 3 ปี',
   'https://drive.google.com/file/d/EXAMPLE_ID_6/view', '2567', 'แผน', 1),
  (3, 'คำสั่งแต่งตั้งคณะกรรมการบริหารโรงเรียน',
   'https://drive.google.com/file/d/EXAMPLE_ID_7/view', '2567', 'คำสั่ง', 2),
  (3, 'รายงานการประเมินตนเอง (SAR) ปีการศึกษา 2567',
   'https://drive.google.com/file/d/EXAMPLE_ID_8/view', '2567', 'รายงาน', 3),

  -- มาตรฐาน 2.2
  (4, 'รายงานการจัดสรรงบประมาณพัฒนาห้องเรียน',
   'https://drive.google.com/file/d/EXAMPLE_ID_9/view', '2567', 'รายงาน', 1),

  -- มาตรฐาน 3.1
  (5, 'แผนการสอนที่เน้นผู้เรียนเป็นสำคัญ ภาคเรียนที่ 1',
   'https://drive.google.com/file/d/EXAMPLE_ID_10/view', '2567', 'แผน', 1),
  (5, 'ภาพถ่ายการจัดกิจกรรมการเรียนรู้',
   'https://drive.google.com/file/d/EXAMPLE_ID_11/view', '2567', 'ภาพถ่าย', 2),
  (5, 'รายงานการนิเทศการสอนภายใน',
   'https://drive.google.com/file/d/EXAMPLE_ID_12/view', '2567', 'รายงาน', 3),

  -- มาตรฐาน 3.2
  (6, 'นวัตกรรมการสอน: PBL ในรายวิชาวิทยาศาสตร์',
   'https://drive.google.com/file/d/EXAMPLE_ID_13/view', '2567', 'นวัตกรรม', 1),
  (6, 'รายงานผลการใช้นวัตกรรมการสอน',
   'https://drive.google.com/file/d/EXAMPLE_ID_14/view', '2567', 'รายงาน', 2);

-- ---- Admin user เริ่มต้น ----
-- password: admin1234 (bcrypt hash — เปลี่ยนรหัสผ่านหลัง deploy ด้วย!)
-- สร้าง hash จริงด้วย: node -e "const b=require('bcrypt');b.hash('รหัสใหม่',10).then(console.log)"
INSERT INTO admin_users (email, display_name, password_hash) VALUES
  ('admin@school.ac.th', 'ผู้ดูแลระบบ',
   '$2b$10$YourBcryptHashHere.ReplaceThisWithRealHash');
