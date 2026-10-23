import { jsonResponse } from '../_lib/auth.js';

// GET /api/wishes — 公开：未实现在前，新添加在前
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, platform, url, title, image, price, note, done, created_at
       FROM wishes ORDER BY done ASC, id DESC LIMIT 500`
  ).all();
  return jsonResponse(results);
}
