import Database from 'better-sqlite3';
import path from 'path';
import { initSchema } from './schema';

const DB_PATH = path.join(process.cwd(), 'data', 'pocketcms.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // データディレクトリが存在しない場合は作成
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
