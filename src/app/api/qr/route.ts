import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// QRコード生成
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'url is required' },
        { status: 400 }
      );
    }

    // QRコードをData URLとして生成
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrDataUrl,
        url,
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// 短縮URL作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId } = body;

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // 既存の短縮URLをチェック
    const existing = db.prepare(
      'SELECT * FROM short_urls WHERE shop_id = ?'
    ).get(shopId);

    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          code: (existing as Record<string, unknown>).code,
          shortUrl: `https://pocketcms.jp/s/${(existing as Record<string, unknown>).code}`,
        },
      });
    }

    // 新規作成
    const id = uuidv4();
    const code = generateShortCode();

    db.prepare(`
      INSERT INTO short_urls (id, shop_id, code, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(id, shopId, code);

    return NextResponse.json({
      success: true,
      data: {
        code,
        shortUrl: `https://pocketcms.jp/s/${code}`,
      },
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
