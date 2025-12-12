import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// FAQ一覧取得
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
    const faqs = db.prepare(
      'SELECT * FROM faqs WHERE shop_id = ? ORDER BY display_order'
    ).all(shopId);

    return NextResponse.json({
      success: true,
      data: faqs.map(formatFAQ),
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// FAQ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const id = uuidv4();
    const maxOrder = db.prepare(
      'SELECT MAX(display_order) as max FROM faqs WHERE shop_id = ?'
    ).get(body.shopId) as { max: number | null };

    db.prepare(`
      INSERT INTO faqs (id, shop_id, question, answer, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      id,
      body.shopId,
      body.question,
      body.answer,
      (maxOrder?.max || 0) + 1
    );

    const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      data: formatFAQ(faq),
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

// FAQ更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    db.prepare(`
      UPDATE faqs SET question = ?, answer = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(body.question, body.answer, body.id);

    const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(body.id);

    return NextResponse.json({
      success: true,
      data: formatFAQ(faq),
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// FAQ削除
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
    db.prepare('DELETE FROM faqs WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}

function formatFAQ(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id,
    shopId: r.shop_id,
    question: r.question,
    answer: r.answer,
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
