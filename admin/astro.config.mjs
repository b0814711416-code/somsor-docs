import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',      // SSR — ต้องการ server เพื่อรัน API routes และ auth
  adapter: node({        // Vercel รองรับ Node.js adapter
    mode: 'standalone',
  }),
  integrations: [tailwind()],
});
