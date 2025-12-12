import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// 店舗一覧取得
export async function GET() {
  try {
    const db = getDb();
    const shops = db.prepare('SELECT * FROM shops ORDER BY created_at DESC').all();

    return NextResponse.json({
      success: true,
      data: shops.map(formatShop),
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}

// 店舗作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const id = uuidv4();
    const subdomain = generateSubdomain(body.name);

    const stmt = db.prepare(`
      INSERT INTO shops (
        id, name, business_type, phone, address, subdomain,
        reservation_url, line_url, brand_color, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      body.name,
      body.businessType || 'beauty',
      body.phone || '',
      body.address || '',
      subdomain,
      body.reservationUrl || null,
      body.lineUrl || null,
      body.brandColor || '#0ea5e9'
    );

    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      data: formatShop(shop),
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shop' },
      { status: 500 }
    );
  }
}

function generateSubdomain(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '')
    .slice(0, 10);
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

function formatShop(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id,
    name: r.name,
    businessType: r.business_type,
    phone: r.phone,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    businessHours: JSON.parse(r.business_hours as string || '[]'),
    regularHolidays: JSON.parse(r.regular_holidays as string || '[]'),
    coverImage: r.cover_image,
    logo: r.logo,
    brandColor: r.brand_color,
    subdomain: r.subdomain,
    customDomain: r.custom_domain,
    reservationUrl: r.reservation_url,
    lineUrl: r.line_url,
    googleMapUrl: r.google_map_url,
    todayAvailable: !!r.today_available,
    ctaSettings: JSON.parse(r.cta_settings as string || '{}'),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
