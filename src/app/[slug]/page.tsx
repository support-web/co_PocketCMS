import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PublicSite } from '@/components/public/PublicSite';
import { BusinessType } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopPublicPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const db = getDb();

    // サブドメインで店舗を検索
    const shop = db.prepare(
      'SELECT * FROM shops WHERE subdomain = ?'
    ).get(slug);

    if (!shop) {
      notFound();
    }

    // 投稿を取得
    const posts = db.prepare(
      `SELECT * FROM posts WHERE shop_id = ? AND status = 'published' ORDER BY created_at DESC`
    ).all((shop as Record<string, unknown>).id);

    // メニューを取得
    const categories = db.prepare(
      'SELECT * FROM menu_categories WHERE shop_id = ? ORDER BY display_order'
    ).all((shop as Record<string, unknown>).id);

    const menus = db.prepare(
      'SELECT * FROM menus WHERE shop_id = ? ORDER BY display_order'
    ).all((shop as Record<string, unknown>).id);

    // スタッフを取得
    const staff = db.prepare(
      'SELECT * FROM staff WHERE shop_id = ? ORDER BY display_order'
    ).all((shop as Record<string, unknown>).id);

    // FAQを取得
    const faqs = db.prepare(
      'SELECT * FROM faqs WHERE shop_id = ? ORDER BY display_order'
    ).all((shop as Record<string, unknown>).id);

    return (
      <PublicSite
        shop={formatShop(shop)}
        posts={posts.map(formatPost)}
        categories={categories.map(formatCategory)}
        menus={menus.map(formatMenu)}
        staff={staff.map(formatStaff)}
        faqs={faqs.map(formatFaq)}
      />
    );
  } catch (error) {
    console.error('Error fetching shop:', error);
    notFound();
  }
}

function formatShop(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    name: r.name as string,
    businessType: r.business_type as BusinessType,
    phone: r.phone as string,
    address: r.address as string,
    latitude: r.latitude as number | undefined,
    longitude: r.longitude as number | undefined,
    businessHours: JSON.parse(r.business_hours as string || '[]'),
    regularHolidays: JSON.parse(r.regular_holidays as string || '[]'),
    coverImage: r.cover_image as string | undefined,
    logo: r.logo as string | undefined,
    brandColor: r.brand_color as string,
    subdomain: r.subdomain as string,
    customDomain: r.custom_domain as string | undefined,
    reservationUrl: r.reservation_url as string | undefined,
    lineUrl: r.line_url as string | undefined,
    googleMapUrl: r.google_map_url as string | undefined,
    todayAvailable: !!r.today_available,
    ctaSettings: JSON.parse(r.cta_settings as string || '{}'),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function formatPost(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    shopId: r.shop_id as string,
    type: r.type as 'case' | 'news',
    title: r.title as string,
    content: r.content as string,
    images: JSON.parse(r.images as string || '[]'),
    tags: JSON.parse(r.tags as string || '[]'),
    duration: r.duration as number | undefined,
    priceRange: r.price_range as 1 | 2 | 3 | undefined,
    staffId: r.staff_id as string | undefined,
    status: r.status as 'draft' | 'published',
    newsType: r.news_type as 'campaign' | 'holiday' | 'availability' | 'other' | undefined,
    displayStart: r.display_start as string | undefined,
    displayEnd: r.display_end as string | undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function formatCategory(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    shopId: r.shop_id as string,
    name: r.name as string,
    displayOrder: r.display_order as number,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function formatMenu(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    shopId: r.shop_id as string,
    categoryId: r.category_id as string,
    name: r.name as string,
    price: r.price as number,
    duration: r.duration as number | undefined,
    description: r.description as string | undefined,
    displayOrder: r.display_order as number,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function formatStaff(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    shopId: r.shop_id as string,
    name: r.name as string,
    role: r.role as string | undefined,
    image: r.image as string | undefined,
    description: r.description as string | undefined,
    displayOrder: r.display_order as number,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function formatFaq(row: unknown) {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    shopId: r.shop_id as string,
    question: r.question as string,
    answer: r.answer as string,
    displayOrder: r.display_order as number,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
