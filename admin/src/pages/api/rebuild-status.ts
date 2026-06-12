import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const githubToken = import.meta.env.GITHUB_ACTIONS_TOKEN;
  const owner       = import.meta.env.GITHUB_OWNER;
  const repo        = import.meta.env.GITHUB_REPO;

  if (!githubToken || !owner || !repo) {
    return new Response(JSON.stringify({ error: 'missing config' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/deploy-public.yml/runs?per_page=1`,
    {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  const data = await res.json() as any;
  const run = data.workflow_runs?.[0];

  if (!run) {
    return new Response(JSON.stringify({ status: 'unknown' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    status:     run.status,       // queued | in_progress | completed
    conclusion: run.conclusion,   // success | failure | null
    run_id:     run.id,
    started_at: run.created_at,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
