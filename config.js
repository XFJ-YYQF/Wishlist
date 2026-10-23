/*
  ────────────────────────────────────────────────────────────
   心愿单配置文件 / Wishlist Config
   页面上能自定义的文字都在这里，改这一个文件就够了，不用碰 index.html。
   改完保存、刷新页面即可看到效果。心愿本身在 /admin.html 后台里添加。
  ────────────────────────────────────────────────────────────
*/
window.SITE_CONFIG = {

  /* 浏览器标签页标题 */
  pageTitle: '心愿单 · Wishlist',

  /* 页面顶部的小字标签 */
  eyebrow: 'Wishlist',

  /* 简介，支持简单 HTML（<strong> 加粗、<br> 换行） */
  introHtml: '想要的东西都记在这里。<br>如果你刚好想送我点什么，点卡片就能直达商品页。',

  /* 主题色，删掉整个 themeColor 或留 null 则使用默认薄荷青 #39C5BB */
  themeColor: {
    accent: '#39C5BB',
    accentDark: '#1FA69C',
    accentTint: '#E6FAF8',
  },

  /* 页面底部署名与链接，不填（删掉对应字段）就不显示 */
  footerName: '夜桜侵雪',
  footerLinks: {
    homepage: { name: '主页', href: 'https://sakurasnow.cn' },
    github: { href: '' },
  },

  /* 底部小字提示，留空字符串则不显示 */
  disclaimer: '价格仅供参考，以商品页实际显示为准。',
};
