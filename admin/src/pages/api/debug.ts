import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

export const GET: APIRoute = async () => {
  const result: Record<string, unknown> = {};

  // 1. Check env vars
  result.has_db_url = !!import.meta.env.DATABASE_URL;
  result.has_jwt_secret = !!import.meta.env.JWT_SECRET;
  result.db_url_prefix = import.meta.env.DATABASE_URL?.slice(0, 20) + '...';

  // 2. Test DB connection
  try {
    const sql = neon(import.meta.env.DATABASE_URL);
    const rows = await sql`SELECT id, email, is_active, LEFT(password_hash,7) AS hash_start FROM admin_users LIMIT 1`;
    result.db_connected = true;
    result.user_found = rows.length > 0;
    result.user_data = rows[0] ?? null;
  } catch (e: unknown) {
    result.db_connected = false;
    result.db_error = e instanceof Error ? e.message : String(e);
  }

  // 3. Test bcryptjs
  try {
    const hash = bcrypt.hashSync('test', 4);
    const match = bcrypt.compareSync('test', hash);
    result.bcryptjs_ok = match;
  } catch (e: unknown) {
    result.bcryptjs_ok = false;
    result.bcryptjs_error = e instanceof Error ? e.message : String(e);
  }

  // 4. Test actual password
  try {
    const sql = neon(import.meta.env.DATABASE_URL);
    const rows = await sql`SELECT password_hash FROM admin_users WHERE email = 'b0814711416@gmail.com' LIMIT 1` as Array<{password_hash: string}>;
    if (rows[0]) {
      const match = bcrypt.compareSync('0814711416', rows[0].password_hash);
      result.password_match = match;
    } else {
      result.password_match = 'user not found';
    }
  } catch (e: unknown) {
    result.password_match = 'error: ' + (e instanceof Error ? e.message : String(e));
  }

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
