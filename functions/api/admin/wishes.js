import { jsonResponse } from '../../_lib/auth.js';
import { platformOf, itemIdOf } from '../../_lib/parse.js';

const clean = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const httpUrl = (v) => { try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.toString() : ''; } catch { return ''; } };

export function readBody(b) {
  const url = httpUrl(clean(b?.url, 2000));
  const title = clean(b?.title, 120);
  if (!url) return { error: '商品链接无效' };
  if (!title) return { error: '标题不能为空' };
  const platform = platformOf(url) || 'other';
  if (b?.price === '' || b?.price == null) return { error: '价格不能为空' };
  const price = Number(b.price);
  if (!isFinite(price) || price <= 0) return { error: '价格无效' };
  const image = httpUrl(clean(b?.image, 2000)) || null;
  return { platform, item_id: itemIdOf(url, platform) || null, url, title, image, price, note: clean(b?.note, 200) || null };
}

// POST /api/admin/wishes — 新增
export async function onRequestPost({ request, env }) {
  let body; try { body = await request.json(); } catch { return jsonResponse({ error: '请求格式错误' }, 400); }
  const w = readBody(body);
  if (w.error) return jsonResponse({ error: w.error }, 400);
  if (w.item_id) {
    const dup = await env.DB.prepare('SELECT id FROM wishes WHERE platform = ? AND item_id = ?').bind(w.platform, w.item_id).first();
    if (dup) return jsonResponse({ error: '这个商品已经在心愿单里了' }, 409);
  }
  const r = await env.DB.prepare(
    'INSERT INTO wishes (platform, item_id, url, title, image, price, note) VALUES (?,?,?,?,?,?,?)'
  ).bind(w.platform, w.item_id, w.url, w.title, w.image, w.price, w.note).run();
  return jsonResponse({ ok: true, id: r.meta.last_row_id }, 201);
}
