import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// 分析データ取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // 特定の日付のデータを取得
    if (date) {
      const analytics = db.prepare(
        'SELECT * FROM analytics WHERE shop_id = ? AND date = ?'
      ).get(shopId, date);

      return NextResponse.json({
        success: true,
        data: analytics ? formatAnalytics(analytics) : {
          shopId,
          date,
          reservationTaps: 0,
          lineTaps: 0,
          phoneTaps: 0,
          pageViews: 0,
        },
      });
    }

    // 期間のデータを取得
    if (startDate && endDate) {
      const analytics = db.prepare(
        'SELECT * FROM analytics WHERE shop_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC'
      ).all(shopId, startDate, endDate);

      return NextResponse.json({
        success: true,
        data: analytics.map(formatAnalytics),
      });
    }

    // 直近7日間のデータを取得
    const analytics = db.prepare(
      `SELECT * FROM analytics WHERE shop_id = ? AND date >= date('now', '-7 days') ORDER BY date DESC`
    ).all(shopId);

    return NextResponse.json({
      success: true,
      data: analytics.map(formatAnalytics),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// 分析データ記録（CTAタップなど）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, type, source } = body;

    if (!shopId || !type) {
      return NextResponse.json(
        { success: false, error: 'shopId and type are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // 今日のデータを取得または作成
    let analytics = db.prepare(
      'SELECT * FROM analytics WHERE shop_id = ? AND date = ?'
    ).get(shopId, today);

    if (!analytics) {
      const id = uuidv4();
      db.prepare(
        `INSERT INTO analytics (id, shop_id, date, reservation_taps, line_taps, phone_taps, page_views, source, created_at)
         VALUES (?, ?, ?, 0, 0, 0, 0, ?, datetime('now'))`
      ).run(id, shopId, today, source || null);
      analytics = db.prepare('SELECT * FROM analytics WHERE id = ?').get(id);
    }

    // カウントを増加
    const columnMap: Record<string, string> = {
      reservation: 'reservation_taps',
      line: 'line_taps',
      phone: 'phone_taps',
      pageView: 'page_views',
    };
    const column = columnMap[type as string];

    if (column) {
      db.prepare(
        `UPDATE analytics SET ${column} = ${column} + 1 WHERE shop_id = ? AND date = ?`
      ).run(shopId, today);
    }

    const updated = db.prepare(
      'SELECT * FROM analytics WHERE shop_id = ? AND date = ?'
    ).get(shopId, today);

    return NextResponse.json({
      success: true,
      data: formatAnalytics(updated),
    });
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
}

function formatAnalytics(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id,
    shopId: r.shop_id,
    date: r.date,
    reservationTaps: r.reservation_taps,
    lineTaps: r.line_taps,
    phoneTaps: r.phone_taps,
    pageViews: r.page_views,
    source: r.source,
    createdAt: r.created_at,
  };
}
