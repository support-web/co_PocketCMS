'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { Post } from '@/types';
import { Plus, Image as ImageIcon, Bell, ExternalLink } from 'lucide-react';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all' | 'case' | 'news'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* ヘッダー */}
      <header className="flex items-center justify-between py-2">
        <h1 className="text-xl font-bold">投稿</h1>
      </header>

      {/* 検索・フィルタ */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter('case')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'case' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          施術例
        </button>
        <button
          onClick={() => setFilter('news')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'news' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          お知らせ
        </button>
      </div>

      {/* 新規作成ボタン */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/posts/new?type=case">
          <Card className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-sm">施術例を追加</p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/posts/new?type=news">
          <Card className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-sm">お知らせ</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* 投稿一覧 */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/admin/posts/${post.id}`}>
              <Card className="flex items-center gap-3">
                {post.images[0] ? (
                  <div
                    className="w-20 h-20 rounded-lg bg-gray-200 bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${post.images[0]})` }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {post.type === 'case' ? (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Bell className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {post.status === 'published' ? '公開中' : '下書き'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {post.type === 'case' ? '施術例' : 'お知らせ'}
                    </span>
                  </div>
                  <p className="font-medium mt-1 truncate">{post.title || '無題'}</p>
                  <div className="flex gap-2 mt-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">まだ投稿がありません</p>
          <Link href="/admin/posts/new?type=case">
            <Button>施術例を追加する</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
