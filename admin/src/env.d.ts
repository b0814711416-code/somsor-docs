/// <reference types="astro/client" />

// ประกาศ type ของ environment variables เพื่อให้ TypeScript รู้จัก
interface ImportMetaEnv {
  readonly DATABASE_URL:           string;
  readonly JWT_SECRET:             string;
  readonly GITHUB_ACTIONS_TOKEN:   string;
  readonly GITHUB_OWNER:           string;
  readonly GITHUB_REPO:            string;
}

// ประกาศ type ของ Astro.locals (ข้อมูลที่ middleware ส่งต่อให้ pages)
declare namespace App {
  interface Locals {
    session?: {
      userId: number;
      email:  string;
    };
  }
}
