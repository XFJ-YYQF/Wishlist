-- 全新安装：wrangler d1 execute wishlist_db --remote --file=./schema.sql
CREATE TABLE IF NOT EXISTS wishes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  platform   TEXT    NOT NULL DEFAULT 'other',   -- taobao | pdd | jd | other
  item_id    TEXT,
  url        TEXT    NOT NULL,
  title      TEXT    NOT NULL,
  image      TEXT,
  price      REAL,
  note       TEXT,
  done       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wishes_created ON wishes(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishes_item ON wishes(platform, item_id) WHERE item_id IS NOT NULL AND item_id != '';
