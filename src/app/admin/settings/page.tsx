'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { Shop } from '@/types';
import { ChevronLeft, Save, Camera, ExternalLink } from 'lucide-react';

const brandColors = [
  { value: '#0ea5e9', label: 'ブルー' },
  { value: '#10b981', label: 'グリーン' },
  { value: '#f59e0b', label: 'オレンジ' },
  { value: '#ec4899', label: 'ピンク' },
  { value: '#8b5cf6', label: 'パープル' },
  { value: '#6b7280', label: 'グレー' },
];

export default function SettingsPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // フォーム状態
  const [name, setName] = useState('');
  const [brandColor, setBrandColor] = useState('#0ea5e9');
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const [logo, setLogo] = useState<string | undefined>();

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const res = await fetch('/api/shops');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const shopData = data.data[0];
        setShop(shopData);
        setName(shopData.name || '');
        setBrandColor(shopData.brandColor || '#0ea5e9');
        setCoverImage(shopData.coverImage);
        setLogo(shopData.logo);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brandColor,
          coverImage,
          logo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShop(data.data);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'logo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        if (type === 'cover') {
          setCoverImage(event.target.result as string);
        } else {
          setLogo(event.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">店舗が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* ヘッダー */}
      <header className="py-2">
        <h1 className="text-xl font-bold">設定</h1>
      </header>

      {/* サイト基本設定 */}
      <Card>
        <h3 className="font-semibold mb-4">サイト基本設定</h3>
        <div className="space-y-4">
          <Input
            label="店舗名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* カバー画像 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カバー画像
            </label>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400 overflow-hidden"
              style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!coverImage && (
                <>
                  <Camera className="w-8 h-8" />
                  <span className="text-sm mt-1">画像を選択</span>
                </>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e, 'cover')}
            />
          </div>

          {/* ロゴ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ロゴ（任意）
            </label>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400 overflow-hidden"
              style={logo ? { backgroundImage: `url(${logo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!logo && (
                <>
                  <Camera className="w-6 h-6" />
                  <span className="text-xs mt-1">追加</span>
                </>
              )}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e, 'logo')}
            />
          </div>

          {/* ブランドカラー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ブランドカラー
            </label>
            <div className="flex flex-wrap gap-3">
              {brandColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setBrandColor(c.value)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    brandColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ドメイン */}
      <Card>
        <h3 className="font-semibold mb-4">ドメイン</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              無料ドメイン
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm">
                {shop.subdomain}.pocketcms.jp
              </div>
              <a
                href={`https://${shop.subdomain}.pocketcms.jp`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              独自ドメイン（Pro以上）
            </label>
            <Input
              placeholder="example.com"
              value={shop.customDomain || ''}
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">
              Proプラン以上で独自ドメインを設定できます
            </p>
          </div>
        </div>
      </Card>

      {/* エクスポート */}
      <Card>
        <h3 className="font-semibold mb-4">データ</h3>
        <div className="space-y-3">
          <Button variant="outline" fullWidth disabled>
            投稿をCSVでエクスポート（準備中）
          </Button>
          <Button variant="outline" fullWidth disabled>
            画像を一括ダウンロード（準備中）
          </Button>
        </div>
      </Card>

      {/* 保存ボタン */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4" style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 64px), 80px)' }}>
        <Button onClick={handleSave} disabled={saving} fullWidth>
          <Save className="w-5 h-5 mr-2" />
          保存する
        </Button>
      </footer>
    </div>
  );
}
