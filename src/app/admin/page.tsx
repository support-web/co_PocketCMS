'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, Toggle, Button } from '@/components/ui';
import { Shop, Post, Analytics } from '@/types';
import { Eye, Share2, Calendar, MessageCircle, Phone, Plus, Edit, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [todayAnalytics, setTodayAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 店舗情報を取得
      const shopsRes = await fetch('/api/shops');
      const shopsData = await shopsRes.json();
      if (shopsData.success && shopsData.data.length > 0) {
        setShop(shopsData.data[0]);

        // 最近の投稿を取得
        const postsRes = await fetch(`/api/posts?shopId=${shopsData.data[0].id}&status=published`);
        const postsData = await postsRes.json();
        if (postsData.success) {
          setRecentPosts(postsData.data.slice(0, 3));
        }

        // 分析データを取得
        const analyticsRes = await fetch(`/api/analytics?shopId=${shopsData.data[0].id}&date=${new Date().toISOString().split('T')[0]}`);
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success && analyticsData.data) {
          setTodayAnalytics(analyticsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodayAvailable = async () => {
    if (!shop) return;

    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todayAvailable: !shop.todayAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setShop(data.data);
      }
    } catch (error) {
      console.error('Error updating shop:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-gray-500 mb-4">店舗が登録されていません</p>
        <Link href="/onboarding">
          <Button>店舗を登録する</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* ヘッダー */}
      <header className="flex items-center justify-between py-2">
        <div>
          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">公開中</span>
          <h1 className="text-lg font-bold mt-1">{shop.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/${shop.subdomain}`} target="_blank">
            <button className="p-2 rounded-lg bg-gray-100">
              <Eye className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <Link href="/admin/links">
            <button className="p-2 rounded-lg bg-gray-100">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
        </div>
      </header>

      {/* 今日の反応 */}
      <Card>
        <CardHeader title="今日の反応" />
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full mx-auto mb-2">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold">{todayAnalytics?.reservationTaps || 0}</p>
            <p className="text-xs text-gray-500">予約タップ</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{todayAnalytics?.lineTaps || 0}</p>
            <p className="text-xs text-gray-500">LINEタップ</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
              <Phone className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{todayAnalytics?.phoneTaps || 0}</p>
            <p className="text-xs text-gray-500">電話タップ</p>
          </div>
        </div>
      </Card>

      {/* 本日の空き */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">本日の空き</h3>
            <p className="text-sm text-gray-500 mt-1">
              {shop.todayAvailable ? '予約ボタンが強調表示されます' : 'ONにすると予約が増えやすくなります'}
            </p>
          </div>
          <Toggle
            checked={shop.todayAvailable}
            onChange={toggleTodayAvailable}
          />
        </div>
      </Card>

      {/* クイックアクション */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/admin/posts/new?type=case">
          <Card className="text-center py-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mx-auto mb-2">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm font-medium">施術例を追加</p>
          </Card>
        </Link>
        <Link href="/admin/posts/new?type=news">
          <Card className="text-center py-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
              <Plus className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium">お知らせ</p>
          </Card>
        </Link>
        <Link href="/admin/pages/menu">
          <Card className="text-center py-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <Edit className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium">メニュー編集</p>
          </Card>
        </Link>
      </div>

      {/* 最近の投稿 */}
      <Card>
        <CardHeader
          title="最近の投稿"
          action={
            <Link href="/admin/posts" className="text-primary-500 text-sm">
              すべて見る
            </Link>
          }
        />
        {recentPosts.length > 0 ? (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/admin/posts/${post.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  {post.images[0] ? (
                    <div
                      className="w-16 h-16 rounded-lg bg-gray-200 bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${post.images[0]})` }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title || '無題'}</p>
                    <div className="flex gap-2 mt-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">まだ投稿がありません</p>
            <Link href="/admin/posts/new?type=case">
              <Button size="sm" className="mt-3">
                施術例を追加する
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
