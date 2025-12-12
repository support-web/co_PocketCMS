import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// 店舗取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(id);

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatShop(shop),
    });
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop' },
      { status: 500 }
    );
  }
}

// 店舗更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const updates: string[] = [];
    const values: unknown[] = [];

    const fields = [
      ['name', 'name'],
      ['businessType', 'business_type'],
      ['phone', 'phone'],
      ['address', 'address'],
      ['latitude', 'latitude'],
      ['longitude', 'longitude'],
      ['coverImage', 'cover_image'],
      ['logo', 'logo'],
      ['brandColor', 'brand_color'],
      ['reservationUrl', 'reservation_url'],
      ['lineUrl', 'line_url'],
      ['googleMapUrl', 'google_map_url'],
      ['todayAvailable', 'today_available'],
    ];

    for (const [jsonKey, dbKey] of fields) {
      if (body[jsonKey] !== undefined) {
        updates.push(`${dbKey} = ?`);
        values.push(jsonKey === 'todayAvailable' ? (body[jsonKey] ? 1 : 0) : body[jsonKey]);
      }
    }

    if (body.businessHours !== undefined) {
      updates.push('business_hours = ?');
      values.push(JSON.stringify(body.businessHours));
    }

    if (body.regularHolidays !== undefined) {
      updates.push('regular_holidays = ?');
      values.push(JSON.stringify(body.regularHolidays));
    }

    if (body.ctaSettings !== undefined) {
      updates.push('cta_settings = ?');
      values.push(JSON.stringify(body.ctaSettings));
    }

    if (updates.length > 0) {
      updates.push('updated_at = datetime(\'now\')');
      values.push(id);

      db.prepare(`UPDATE shops SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      data: formatShop(shop),
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shop' },
      { status: 500 }
    );
  }
}

// 店舗削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    db.prepare('DELETE FROM shops WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shop' },
      { status: 500 }
    );
  }
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
