# 心愿单 / Wishlist

沿用友链页 / 捐赠页的设计与部署方式：Cloudflare Pages + Functions + D1，`config.js` 改文案，`/admin.html` 管理。

## 部署
```bash
wrangler d1 create wishlist_db                      # 把输出的 id 填进 wrangler.toml
wrangler d1 execute wishlist_db --remote --file=./schema.sql
wrangler pages secret put ADMIN_PASSWORD            # 后台密码
wrangler pages secret put SESSION_SECRET            # 可选
wrangler pages deploy .
```
Pages 项目里 Settings → Bindings 确认 D1 绑定名为 `DB`（`wrangler.toml` 已声明）。

## 使用
`/admin.html` 登录后，粘贴链接或整段分享文案 → 自动解析 → 确认保存。
淘宝 / 拼多多对云端请求常返回登录页，抓不到的标题、主图、价格在表单里手动补一下即可；京东成功率最高。
