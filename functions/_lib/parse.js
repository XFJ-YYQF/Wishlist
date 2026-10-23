// 商品链接 / 分享文案解析：识别平台与商品 ID，并尽力抓取标题、主图、价格。
const PLATFORMS = {
  taobao: ['taobao.com', 'tmall.com', 'tb.cn', 'tmall.hk'],
  pdd: ['pinduoduo.com', 'yangkeduo.com', 'pdd.net'],
  jd: ['jd.com', '3.cn', 'jd.hk'],
};
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export function platformOf(u) {
  try {
    const h = new URL(u).hostname;
    for (const k in PLATFORMS) if (PLATFORMS[k].some((d) => h === d || h.endsWith('.' + d))) return k;
  } catch {}
  return null;
}

export function itemIdOf(url, p) {
  try {
    const u = new URL(url);
    if (p === 'taobao') return u.searchParams.get('id') || u.searchParams.get('itemId') || '';
    if (p === 'pdd') return u.searchParams.get('goods_id') || '';
    if (p === 'jd') return (u.pathname.match(/(\d{5,})\.html/) || [])[1] || u.searchParams.get('sku') || '';
  } catch {}
  return '';
}

// 手动跟随跳转（短链 → 商品页）；只允许停留在三个平台的域名内，避免被当成开放代理
async function resolve(url, hops = 5) {
  let cur = url, html = '';
  for (let i = 0; i < hops; i++) {
    if (!platformOf(cur)) break;
    const r = await fetch(cur, { redirect: 'manual', headers: { 'user-agent': UA, 'accept-language': 'zh-CN,zh;q=0.9' } });
    const loc = r.headers.get('location');
    if (r.status >= 300 && r.status < 400 && loc) { cur = new URL(loc, cur).toString(); continue; }
    html = (await r.text()).slice(0, 400000);
    break;
  }
  return { url: cur, html };
}

const meta = (html, prop) => {
  const a = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i');
  const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i');
  return (html.match(a) || html.match(b) || [])[1] || '';
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

// 从整段分享文案里取标题 / 价格（短链打不开时的兜底）
function fromShareText(text) {
  const quoted = text.match(/[「『《]([^」』》]{3,})[」』》]/);
  let title = quoted ? quoted[1] : '';
  if (!title) {
    title = text.replace(/https?:\/\/\S+/g, '').replace(/[￥$€₴][A-Za-z0-9()]{6,}[￥$€₴]?/g, '')
      .split(/\n+/)
      .map((s) => s.trim().replace(/^【[^】]*】/, '')
        .replace(/(复制|打开|点击|长按|手机淘宝|淘宝|拼多多|京东|App|APP|商品链接|口令|分享)[^，。\s]{0,12}(打开|查看|购买)?/g, '')
        .replace(/[，。\s]+$/, ''))
      .filter((s) => s.length >= 4)
      .sort((a, b) => b.length - a.length)[0] || '';
  }
  const pm = text.match(/(?:¥|￥)\s?(\d+(?:\.\d{1,2})?)(?![A-Za-z])/) || text.match(/(?:券后|到手|仅需|现价|拼单价)\D{0,3}(\d+(?:\.\d{1,2})?)/);
  return { title: title.slice(0, 80), price: pm ? pm[1] : '' };
}

export async function parseInput(raw) {
  const first = (raw.match(/https?:\/\/[^\s\u3000"'<>）」』】]+/) || [])[0];
  if (!first) return { error: '没有找到链接' };
  if (!platformOf(first)) return { error: '目前只支持淘宝 / 拼多多 / 京东链接' };

  const text = fromShareText(raw);
  let url = first, html = '';
  try { ({ url, html } = await resolve(first)); } catch {}
  const platform = platformOf(url) || platformOf(first);

  let title = decode(meta(html, 'og:title') || (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '');
  title = title.replace(/[-_ ]*(京东|淘宝网?|天猫|拼多多|Tmall\.com).*$/i, '').trim();
  if (/登录|验证|login|captcha|安全/i.test(title) && title.length < 12) title = '';

  let image = meta(html, 'og:image') || (html.match(/"(?:pic|image|imageUrl|hdThumbUrl)"\s*:\s*"((?:https?:)?\/\/[^"]+)"/) || [])[1] || '';
  if (image.startsWith('//')) image = 'https:' + image;
  const price = meta(html, 'og:product:price') || (html.match(/"(?:price|minPrice|minGroupPrice)"\s*:\s*"?(\d+(?:\.\d{1,2})?)"?/) || [])[1] || text.price;

  return {
    url, platform, itemId: itemIdOf(url, platform),
    title: title || text.title, image, price,
    partial: !title || !image,   // 抓取不完整时让前端提示手动补充
  };
}
