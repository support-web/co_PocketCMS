import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// 投稿一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const db = getDb();
    let query = 'SELECT * FROM posts WHERE 1=1';
    const params: unknown[] = [];

    if (shopId) {
      query += ' AND shop_id = ?';
      params.push(shopId);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const posts = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      data: posts.map(formatPost),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// 投稿作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO posts (
        id, shop_id, type, title, content, images, tags, duration,
        price_range, staff_id, status, news_type, display_start, display_end,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      body.shopId,
      body.type || 'case',
      body.title || '',
      body.content || '',
      JSON.stringify(body.images || []),
      JSON.stringify(body.tags || []),
      body.duration || null,
      body.priceRange || null,
      body.staffId || null,
      body.status || 'draft',
      body.newsType || null,
      body.displayStart || null,
      body.displayEnd || null
    );

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      data: formatPost(post),
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

function formatPost(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id,
    shopId: r.shop_id,
    type: r.type,
    title: r.title,
    content: r.content,
    images: JSON.parse(r.images as string || '[]'),
    tags: JSON.parse(r.tags as string || '[]'),
    duration: r.duration,
    priceRange: r.price_range,
    staffId: r.staff_id,
    status: r.status,
    newsType: r.news_type,
    displayStart: r.display_start,
    displayEnd: r.display_end,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
