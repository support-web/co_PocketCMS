import type Database from 'better-sqlite3';

export function initSchema(db: Database.Database): void {
  // 店舗テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS shops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      business_type TEXT NOT NULL DEFAULT 'beauty',
      phone TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      business_hours TEXT DEFAULT '[]',
      regular_holidays TEXT DEFAULT '[]',
      cover_image TEXT,
      logo TEXT,
      brand_color TEXT DEFAULT '#0ea5e9',
      subdomain TEXT UNIQUE NOT NULL,
      custom_domain TEXT,
      reservation_url TEXT,
      line_url TEXT,
      google_map_url TEXT,
      today_available INTEGER DEFAULT 0,
      cta_settings TEXT DEFAULT '{"showReservation":true,"showLine":true,"showPhone":true,"order":["reservation","line","phone"]}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 投稿テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'case',
      title TEXT NOT NULL,
      content TEXT,
      images TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      duration INTEGER,
      price_range INTEGER,
      staff_id TEXT,
      status TEXT DEFAULT 'draft',
      news_type TEXT,
      display_start TEXT,
      display_end TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  // メニューカテゴリテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      name TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  // メニューテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      duration INTEGER,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
    )
  `);

  // スタッフテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      image TEXT,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  // FAQテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  // 分析データテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      date TEXT NOT NULL,
      reservation_taps INTEGER DEFAULT 0,
      line_taps INTEGER DEFAULT 0,
      phone_taps INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 0,
      source TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  // 短縮URLテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS short_urls (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  // インデックスの作成
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_shop_id ON posts(shop_id);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_menus_shop_id ON menus(shop_id);
    CREATE INDEX IF NOT EXISTS idx_menus_category_id ON menus(category_id);
    CREATE INDEX IF NOT EXISTS idx_staff_shop_id ON staff(shop_id);
    CREATE INDEX IF NOT EXISTS idx_faqs_shop_id ON faqs(shop_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_shop_id_date ON analytics(shop_id, date);
    CREATE INDEX IF NOT EXISTS idx_shops_subdomain ON shops(subdomain);
  `);
}
