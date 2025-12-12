import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// スタッフ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const staff = db.prepare(
      'SELECT * FROM staff WHERE shop_id = ? ORDER BY display_order'
    ).all(shopId);

    return NextResponse.json({
      success: true,
      data: staff.map(formatStaff),
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// スタッフ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const id = uuidv4();
    const maxOrder = db.prepare(
      'SELECT MAX(display_order) as max FROM staff WHERE shop_id = ?'
    ).get(body.shopId) as { max: number | null };

    db.prepare(`
      INSERT INTO staff (id, shop_id, name, role, image, description, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      id,
      body.shopId,
      body.name,
      body.role || null,
      body.image || null,
      body.description || null,
      (maxOrder?.max || 0) + 1
    );

    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      data: formatStaff(staff),
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create staff' },
      { status: 500 }
    );
  }
}

// スタッフ更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    db.prepare(`
      UPDATE staff SET name = ?, role = ?, image = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(body.name, body.role || null, body.image || null, body.description || null, body.id);

    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(body.id);

    return NextResponse.json({
      success: true,
      data: formatStaff(staff),
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

// スタッフ削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare('DELETE FROM staff WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}

function formatStaff(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id,
    shopId: r.shop_id,
    name: r.name,
    role: r.role,
    image: r.image,
    description: r.description,
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
