import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';

export default function HomePage() {
  // 店舗が存在するかチェック
  let hasShop = false;
  try {
    const db = getDb();
    const shop = db.prepare('SELECT id FROM shops LIMIT 1').get();
    hasShop = !!shop;
  } catch {
    // DBエラーの場合はオンボーディングへ
  }

  if (hasShop) {
    redirect('/admin');
  } else {
    redirect('/onboarding');
  }
}
