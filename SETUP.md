# คู่มือ Setup ระบบเอกสาร สมศ. รอบห้า
ทำตามลำดับขั้นตอนต่อไปนี้ทีละขั้นครับ

---

## ขั้นตอนที่ 1 — สร้างฐานข้อมูล Neon.tech

1. ไปที่ https://neon.tech → Sign Up (ฟรี)
2. สร้าง Project ใหม่ (เลือก Region: Singapore ap-southeast-1)
3. ไปที่ **SQL Editor** วางและรันเนื้อหาจากไฟล์ `database/schema.sql`
4. รันไฟล์ `database/seed.sql` (ข้อมูลตัวอย่าง)
   - หากเป็นฐานข้อมูลเดิมที่ตั้งไว้ก่อนมีฟีเจอร์ tag ให้รัน `database/migration-tags.sql` เพิ่มเติม
     (schema.sql ใหม่รวมคอลัมน์ `tags` ไว้แล้ว — migration ใช้เฉพาะกรณีอัปเกรดฐานข้อมูลเก่า)
5. ไปที่ **Dashboard → Connection Details** → คัดลอก **Connection string**
   รูปแบบ: `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`
6. **ตั้งรหัสผ่าน Admin จริง:**
   เปิด Terminal รัน:
   ```bash
   node -e "const b=require('bcrypt'); b.hash('รหัสผ่านใหม่', 10).then(h => console.log(h))"
   ```
   นำ hash ที่ได้ไปใส่ใน SQL Editor:
   ```sql
   UPDATE admin_users SET password_hash = 'HASH_ที่ได้' WHERE email = 'admin@school.ac.th';
   ```

---

## ขั้นตอนที่ 2 — Deploy Public Site ไป GitHub Pages

1. สร้าง GitHub Repository ใหม่ (เช่นชื่อ `somsor-docs`)
2. แก้ไข `public-site/astro.config.mjs`:
   ```js
   site: 'https://YOUR_USERNAME.github.io',
   base: '/somsor-docs',   // ชื่อ repo
   ```
3. ตั้งค่า **GitHub Secrets** (Repository → Settings → Secrets → Actions):
   - `DATABASE_URL` = Connection string จาก Neon
   - `SCHOOL_NAME` = ชื่อโรงเรียน
   - `SCHOOL_SUBTITLE` = สังกัด
4. ไปที่ **Settings → Pages → Source**: เลือก **GitHub Actions**
5. Push โค้ดไป main branch → GitHub Actions จะ build และ deploy อัตโนมัติ
6. เว็บไซต์จะอยู่ที่: `https://YOUR_USERNAME.github.io/somsor-docs`

---

## ขั้นตอนที่ 3 — Deploy Admin Panel ไป Vercel

1. ไปที่ https://vercel.com → Sign Up / Login ด้วย GitHub
2. กด **Add New Project** → เลือก Repository เดิม
3. ตั้งค่า **Root Directory**: `admin`
4. ตั้งค่า **Environment Variables** ใน Vercel:
   - `DATABASE_URL` = Connection string จาก Neon
   - `JWT_SECRET` = รหัสสุ่มยาวๆ (รัน: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `GITHUB_ACTIONS_TOKEN` = GitHub Personal Access Token (ดูขั้นตอน 3a)
   - `GITHUB_OWNER` = GitHub username
   - `GITHUB_REPO` = ชื่อ repo
   - `GOOGLE_CLIENT_ID` = ใช้ค่าเดียวกับระบบนโยบาย สพฐ.
   - `GOOGLE_CLIENT_SECRET` = ใช้ค่าเดียวกับระบบนโยบาย สพฐ.
   - `GOOGLE_REFRESH_TOKEN` = ใช้ค่าเดียวกับระบบนโยบาย สพฐ.
   - `GOOGLE_DRIVE_ROOT_FOLDER_ID` = ID ของ folder สมศ. ใน Google Drive (ดูขั้นตอน 3b)
5. กด **Deploy**

### ขั้นตอนที่ 3b — ตั้งค่า Google Drive สำหรับอัปโหลดไฟล์อัตโนมัติ

> **ใช้ credentials เดียวกับระบบนโยบาย สพฐ.** — คัดลอก `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` จาก Vercel project นโยบาย สพฐ. มาใส่ได้เลย

#### สร้าง Root Folder ใน Google Drive
1. เปิด Google Drive → สร้าง Folder ใหม่ เช่น `📁 สมศ. รอบ 5 - ชื่อโรงเรียน`
2. เปิด Folder นั้น → Copy **Folder ID** จาก URL:
   `https://drive.google.com/drive/folders/`**`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`**

#### ใส่ค่าใน Vercel
- `GOOGLE_CLIENT_ID` = ค่าเดียวกับระบบนโยบาย สพฐ.
- `GOOGLE_CLIENT_SECRET` = ค่าเดียวกับระบบนโยบาย สพฐ.
- `GOOGLE_REFRESH_TOKEN` = ค่าเดียวกับระบบนโยบาย สพฐ.
- `GOOGLE_DRIVE_ROOT_FOLDER_ID` = Folder ID จากข้อ 2

### ขั้นตอนที่ 3a — สร้าง GitHub Token สำหรับ Admin

1. ไปที่ https://github.com/settings/tokens
2. **Fine-grained tokens → Generate new token**
3. ตั้งค่า:
   - Repository access: เลือก repo นี้เท่านั้น
   - Permissions: **Actions** → Read & Write
4. Copy token → ใส่เป็น `GITHUB_ACTIONS_TOKEN` ใน Vercel

---

## สรุป Architecture

```
กรรมการ สมศ.
    │  เข้าถึงผ่าน browser
    ▼
GitHub Pages (Astro SSG)  ← static HTML/CSS/JS
    │  Build จากข้อมูล Neon
    ▼
Neon.tech PostgreSQL  ←────────────────────┐
                                           │ CRUD
                                    Vercel (Astro SSR)
                                    Admin Panel
                                    (Login required)
                                           │
                               trigger rebuild via
                                    GitHub API
                                           │
                                    GitHub Actions
                                    rebuild + deploy
```

### การไหลของข้อมูล:
1. Admin เปิด `https://your-admin.vercel.app` → Login
2. เพิ่ม/แก้ไขเอกสารใน Admin → บันทึกลง Neon
3. กดปุ่ม **Rebuild เว็บไซต์** → เรียก GitHub Actions
4. GitHub Actions ดึงข้อมูลจาก Neon → Build Astro → Deploy ไป GitHub Pages
5. กรรมการ สมศ. เข้าเว็บ GitHub Pages → เห็นข้อมูลล่าสุด

---

## การทดสอบ Local

```bash
# Public site
cd public-site
cp .env.example .env   # แก้ไขค่า DATABASE_URL
npm install
npm run dev            # http://localhost:4321

# Admin panel
cd admin
cp .env.example .env   # แก้ไขทุกค่า
npm install
npm run dev            # http://localhost:4321
```
