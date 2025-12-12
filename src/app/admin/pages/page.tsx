'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';
import { Store, Menu, Users, HelpCircle, ChevronRight } from 'lucide-react';

const pages = [
  {
    name: '店舗情報',
    description: '住所・営業時間・支払い方法など',
    href: '/admin/pages/shop',
    icon: Store,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'メニュー/料金',
    description: 'メニューと価格の管理',
    href: '/admin/pages/menu',
    icon: Menu,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'スタッフ',
    description: 'スタッフ紹介の管理',
    href: '/admin/pages/staff',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'よくある質問',
    description: 'FAQの管理',
    href: '/admin/pages/faq',
    icon: HelpCircle,
    color: 'bg-orange-100 text-orange-600',
  },
];

export default function PagesListPage() {
  return (
    <div className="p-4 space-y-4">
      {/* ヘッダー */}
      <header className="py-2">
        <h1 className="text-xl font-bold">ページ</h1>
        <p className="text-sm text-gray-500 mt-1">固定ページの内容を編集します</p>
      </header>

      {/* ページ一覧 */}
      <div className="space-y-3">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Link key={page.name} href={page.href}>
              <Card className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${page.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{page.name}</p>
                  <p className="text-sm text-gray-500">{page.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
