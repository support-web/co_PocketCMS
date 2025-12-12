import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// メニュー一覧取得
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

    // カテゴリとメニューを取得
    const categories = db.prepare(
      'SELECT * FROM menu_categories WHERE shop_id = ? ORDER BY display_order'
    ).all(shopId);

    const menus = db.prepare(
      'SELECT * FROM menus WHERE shop_id = ? ORDER BY display_order'
    ).all(shopId);

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map(formatCategory),
        menus: menus.map(formatMenu),
      },
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

// カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    if (body.type === 'category') {
      const id = uuidv4();
      const maxOrder = db.prepare(
        'SELECT MAX(display_order) as max FROM menu_categories WHERE shop_id = ?'
      ).get(body.shopId) as { max: number | null };

      db.prepare(`
        INSERT INTO menu_categories (id, shop_id, name, display_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(id, body.shopId, body.name, (maxOrder?.max || 0) + 1);

      const category = db.prepare('SELECT * FROM menu_categories WHERE id = ?').get(id);
      return NextResponse.json({ success: true, data: formatCategory(category) });
    }

    // メニュー作成
    const id = uuidv4();
    const maxOrder = db.prepare(
      'SELECT MAX(display_order) as max FROM menus WHERE shop_id = ? AND category_id = ?'
    ).get(body.shopId, body.categoryId) as { max: number | null };

    db.prepare(`
      INSERT INTO menus (id, shop_id, category_id, name, price, duration, description, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      id,
      body.shopId,
      body.categoryId,
      body.name,
      body.price,
      body.duration || null,
      body.description || null,
      (maxOrder?.max || 0) + 1
    );

    const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: formatMenu(menu) });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}

// メニュー更新/削除
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    if (body.type === 'category') {
      db.prepare(`
        UPDATE menu_categories SET name = ?, updated_at = datetime('now') WHERE id = ?
      `).run(body.name, body.id);

      const category = db.prepare('SELECT * FROM menu_categories WHERE id = ?').get(body.id);
      return NextResponse.json({ success: true, data: formatCategory(category) });
    }

    db.prepare(`
      UPDATE menus SET name = ?, price = ?, duration = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(body.name, body.price, body.duration || null, body.description || null, body.id);

    const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(body.id);
    return NextResponse.json({ success: true, data: formatMenu(menu) });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    if (type === 'category') {
      db.prepare('DELETE FROM menus WHERE category_id = ?').run(id);
      db.prepare('DELETE FROM menu_categories WHERE id = ?').run(id);
    } else {
      db.prepare('DELETE FROM menus WHERE id = ?').run(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}

function formatCategory(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id,
    shopId: r.shop_id,
    name: r.name,
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function formatMenu(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id,
    shopId: r.shop_id,
    categoryId: r.category_id,
    name: r.name,
    price: r.price,
    duration: r.duration,
    description: r.description,
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
