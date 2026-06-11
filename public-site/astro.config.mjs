import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // เปลี่ยน 'your-repo-name' เป็นชื่อ GitHub Repository จริงของคุณ
  // เช่น ถ้า repo ชื่อ somsor-docs → base: '/somsor-docs'
  // *** แก้ตรงนี้ก่อน push ***
  // เปลี่ยน YOUR_USERNAME เป็น GitHub username จริง เช่น 'school-admin'
  // เปลี่ยน somsor-docs เป็นชื่อ repo จริง (ถ้าตั้งชื่ออื่น)
  site: 'https://b0814711416-code.github.io',
  base: '/somsor-docs',

  output: 'static', // SSG — build เป็นไฟล์ HTML นิ่งๆ

  integrations: [tailwind()],
});
