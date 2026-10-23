import { jsonResponse } from '../../../_lib/auth.js';
import { readBody } from '../wishes.js';

// PUT /api/admin/wishes/:id — 整条更新，或只切换 done：{ "done": true }
export async function onRequestPut({ request, env, params }) {
  let body; try { body = await request.json(); } catch { return jsonResponse({ error: '请求格式错误' }, 400); }
  if (Object.keys(body).length === 1 && 'done' in body) {
    await env.DB.prepare('UPDATE wishes SET done = ? WHERE id = ?').bind(body.done ? 1 : 0, params.id).run();
    return jsonResponse({ ok: true });
  }
  const w = readBody(body);
  if (w.error) return jsonResponse({ error: w.error }, 400);
  await env.DB.prepare(
    'UPDATE wishes SET platform=?, item_id=?, url=?, title=?, image=?, price=?, note=? WHERE id=?'
  ).bind(w.platform, w.item_id, w.url, w.title, w.image, w.price, w.note, params.id).run();
  return jsonResponse({ ok: true });
}

// DELETE /api/admin/wishes/:id
export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM wishes WHERE id = ?').bind(params.id).run();
  return jsonResponse({ ok: true });
}
