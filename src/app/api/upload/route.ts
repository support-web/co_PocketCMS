import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// 画像アップロード（WebP変換・圧縮）
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    // MIMEタイプチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only images are allowed' },
        { status: 400 }
      );
    }

    // アップロードディレクトリ作成
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ファイル名生成
    const fileId = uuidv4();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${fileId}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // ファイル保存
    const buffer = Buffer.from(await file.arrayBuffer());

    // sharpでWebP変換・圧縮（sharpが利用可能な場合）
    try {
      const sharp = require('sharp');
      const webpFilename = `${fileId}.webp`;
      const webpFilepath = path.join(uploadDir, webpFilename);

      await sharp(buffer)
        .webp({ quality: 80 })
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .toFile(webpFilepath);

      return NextResponse.json({
        success: true,
        data: {
          url: `/uploads/${webpFilename}`,
          originalName: file.name,
          size: file.size,
        },
      });
    } catch (sharpError) {
      // sharpが使えない場合は元のファイルをそのまま保存
      fs.writeFileSync(filepath, buffer);

      return NextResponse.json({
        success: true,
        data: {
          url: `/uploads/${filename}`,
          originalName: file.name,
          size: file.size,
        },
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
