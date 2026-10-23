import { jsonResponse } from '../../_lib/auth.js';
import { parseInput } from '../../_lib/parse.js';

// GET /api/admin/parse?q=<链接或整段分享文案>
export async function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams.get('q') || '';
  if (!q.trim()) return jsonResponse({ error: '内容为空' }, 400);
  try {
    const r = await parseInput(q.slice(0, 2000));
    return jsonResponse(r, r.error ? 422 : 200);
  } catch (e) {
    return jsonResponse({ error: '解析失败，请手动填写' }, 502);
  }
}
