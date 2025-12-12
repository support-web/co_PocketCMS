'use client';

import { useState } from 'react';
import { Shop, Post, MenuCategory, Menu, Staff, FAQ, CTASettings } from '@/types';
import { Calendar, MessageCircle, Phone, MapPin, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';

interface PublicSiteProps {
  shop: Shop;
  posts: Post[];
  categories: MenuCategory[];
  menus: Menu[];
  staff: Staff[];
  faqs: FAQ[];
}

export function PublicSite({ shop, posts, categories, menus, staff, faqs }: PublicSiteProps) {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const ctaSettings = shop.ctaSettings as CTASettings || { showReservation: true, showLine: true, showPhone: true };

  const casePosts = posts.filter((p) => p.type === 'case');
  const newsPosts = posts.filter((p) => p.type === 'news');

  const handleCTAClick = async (type: 'reservation' | 'line' | 'phone') => {
    // 分析データを記録
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, type }),
      });
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  };

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* ヘッダー/カバー */}
      <header className="relative">
        {shop.coverImage ? (
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${shop.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ) : (
          <div
            className="h-48"
            style={{ backgroundColor: shop.brandColor }}
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h1 className="text-2xl font-bold drop-shadow-lg">{shop.name}</h1>
          {shop.todayAvailable && (
            <span className="inline-block mt-2 px-3 py-1 bg-green-500 rounded-full text-sm font-medium">
              本日空きあり
            </span>
          )}
        </div>
      </header>

      {/* お知らせ */}
      {newsPosts.length > 0 && (
        <section className="p-4 border-b border-gray-100">
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">お知らせ</h3>
            {newsPosts.slice(0, 1).map((news) => (
              <div key={news.id}>
                <p className="font-medium">{news.title}</p>
                <p className="text-sm text-gray-600 mt-1">{news.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 施術例 */}
      {casePosts.length > 0 && (
        <section className="p-4">
          <h2 className="text-lg font-bold mb-4">施術例</h2>
          <div className="grid grid-cols-2 gap-3">
            {casePosts.slice(0, 6).map((post) => (
              <div key={post.id} className="rounded-lg overflow-hidden border border-gray-100">
                {post.images[0] ? (
                  <div
                    className="aspect-square bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.images[0]})` }}
                  />
                ) : (
                  <div className="aspect-square bg-gray-200" />
                )}
                <div className="p-2">
                  <p className="font-medium text-sm truncate">{post.title || '施術例'}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* メニュー/料金 */}
      {categories.length > 0 && (
        <section className="p-4 bg-gray-50">
          <h2 className="text-lg font-bold mb-4">メニュー/料金</h2>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{category.name}</h3>
                <div className="space-y-2">
                  {menus
                    .filter((m) => m.categoryId === category.id)
                    .map((menu) => (
                      <div key={menu.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium">{menu.name}</p>
                          {menu.duration && (
                            <p className="text-sm text-gray-500">{menu.duration}分</p>
                          )}
                        </div>
                        <p className="font-semibold" style={{ color: shop.brandColor }}>
                          ¥{menu.price.toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* スタッフ */}
      {staff.length > 0 && (
        <section className="p-4">
          <h2 className="text-lg font-bold mb-4">スタッフ</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {staff.map((s) => (
              <div key={s.id} className="flex-shrink-0 text-center">
                {s.image ? (
                  <div
                    className="w-20 h-20 rounded-full bg-cover bg-center mx-auto"
                    style={{ backgroundImage: `url(${s.image})` }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <p className="font-medium mt-2">{s.name}</p>
                {s.role && <p className="text-xs text-gray-500">{s.role}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 店舗情報 */}
      <section className="p-4 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">店舗情報</h2>
        <div className="bg-white rounded-lg p-4 space-y-4">
          {/* 住所 */}
          {shop.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">住所</p>
                <p className="font-medium">{shop.address}</p>
                {shop.googleMapUrl && (
                  <a
                    href={shop.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm mt-1 inline-block"
                    style={{ color: shop.brandColor }}
                  >
                    Googleマップで開く
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 営業時間 */}
          {shop.businessHours?.length > 0 && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">営業時間</p>
                <div className="space-y-1 mt-1">
                  {shop.businessHours.map((hour, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="w-6">{dayNames[hour.dayOfWeek]}</span>
                      {hour.isOpen ? (
                        <span>{hour.openTime} - {hour.closeTime}</span>
                      ) : (
                        <span className="text-gray-400">定休日</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 電話番号 */}
          {shop.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">電話番号</p>
                <a href={`tel:${shop.phone}`} className="font-medium">
                  {shop.phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="p-4">
          <h2 className="text-lg font-bold mb-4">よくある質問</h2>
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 固定フッターCTA */}
      <footer
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      >
        {ctaSettings.showPhone && shop.phone && (
          <a
            href={`tel:${shop.phone}`}
            onClick={() => handleCTAClick('phone')}
            className="flex-1 flex flex-col items-center justify-center py-3 text-orange-500"
          >
            <Phone className="w-6 h-6" />
            <span className="text-xs mt-1">電話</span>
          </a>
        )}
        {ctaSettings.showReservation && shop.reservationUrl && (
          <a
            href={shop.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCTAClick('reservation')}
            className={`flex-1 flex flex-col items-center justify-center py-3 ${
              shop.todayAvailable ? 'text-white' : ''
            }`}
            style={{
              backgroundColor: shop.todayAvailable ? shop.brandColor : undefined,
              color: shop.todayAvailable ? 'white' : shop.brandColor,
            }}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">
              {shop.todayAvailable ? '今すぐ予約' : '予約'}
            </span>
          </a>
        )}
        {ctaSettings.showLine && shop.lineUrl && (
          <a
            href={shop.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCTAClick('line')}
            className="flex-1 flex flex-col items-center justify-center py-3 text-green-500"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">LINE</span>
          </a>
        )}
      </footer>
    </div>
  );
}
