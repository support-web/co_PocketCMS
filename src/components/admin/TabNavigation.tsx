'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image, FileText, Link2, Settings } from 'lucide-react';

const tabs = [
  { name: 'ホーム', href: '/admin', icon: Home },
  { name: '投稿', href: '/admin/posts', icon: Image },
  { name: 'ページ', href: '/admin/pages', icon: FileText },
  { name: '導線', href: '/admin/links', icon: Link2 },
  { name: '設定', href: '/admin/settings', icon: Settings },
];

export function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/admin' && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-2 px-4 min-w-[64px] ${
                isActive ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
