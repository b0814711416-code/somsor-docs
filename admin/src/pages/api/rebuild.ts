/**
 * POST /api/rebuild
 * เรียก GitHub Actions workflow_dispatch เพื่อ rebuild + redeploy public site
 * หลังจาก admin บันทึกข้อมูลใหม่
 */
import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  const githubToken = import.meta.env.GITHUB_ACTIONS_TOKEN;
  const owner       = import.meta.env.GITHUB_OWNER;       // เช่น "your-username"
  const repo        = import.meta.env.GITHUB_REPO;        // เช่น "somsor-docs"
  const workflow    = 'deploy-public.yml';

  if (!githubToken || !owner || !repo) {
    return new Response(
      JSON.stringify({ error: 'GitHub configuration missing in environment variables' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // เรียก GitHub API เพื่อ trigger workflow
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept':        'application/vnd.github+json',
        'Content-Type':  'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );

  // GitHub ตอบ 204 No Content เมื่อสำเร็จ
  if (response.status === 204) {
    return new Response(
      JSON.stringify({ ok: true, message: 'เริ่ม rebuild เว็บไซต์แล้ว (ใช้เวลาประมาณ 1-2 นาที)' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  const errorBody = await response.text();
  return new Response(
    JSON.stringify({ error: `GitHub API error: ${response.status}`, detail: errorBody }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
};
