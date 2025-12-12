'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { Camera, X, Plus } from 'lucide-react';

const commonTags = {
  beauty: ['カット', 'カラー', 'パーマ', 'トリートメント', 'ヘアセット', '縮毛矯正'],
  bodywork: ['肩こり', '腰痛', '骨盤矯正', '小顔', '全身', 'ヘッドスパ'],
  nail: ['ジェルネイル', 'フレンチ', 'グラデーション', 'アート', 'フットネイル'],
  eyelash: ['まつげパーマ', 'エクステ', 'フラットラッシュ', 'ボリュームラッシュ'],
};

const durations = [30, 45, 60, 90, 120, 180];
const priceRanges = [
  { value: 1, label: '¥' },
  { value: 2, label: '¥¥' },
  { value: 3, label: '¥¥¥' },
];

const newsTypes = [
  { value: 'campaign', label: 'キャンペーン' },
  { value: 'holiday', label: '休業' },
  { value: 'availability', label: '空き情報' },
  { value: 'other', label: 'その他' },
];

function NewPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'case';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shopId, setShopId] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState<1 | 2 | 3 | undefined>();
  const [newsType, setNewsType] = useState('campaign');
  const [displayStart, setDisplayStart] = useState('');
  const [displayEnd, setDisplayEnd] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 店舗IDを取得
    fetch('/api/shops')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setShopId(data.data[0].id);
        }
      });
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (images.length >= 6) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev.slice(0, 5), event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!shopId) return;
    setSaving(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          type,
          title,
          content,
          images,
          tags: selectedTags,
          duration: type === 'case' ? duration : undefined,
          priceRange: type === 'case' ? priceRange : undefined,
          newsType: type === 'news' ? newsType : undefined,
          displayStart: type === 'news' ? displayStart : undefined,
          displayEnd: type === 'news' ? displayEnd : undefined,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/posts');
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  const availableTags = commonTags.beauty; // TODO: 業種に応じて変更

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* ヘッダー */}
      <header className="flex items-center justify-between py-2">
        <h1 className="text-xl font-bold">
          {type === 'case' ? '施術例を追加' : 'お知らせを追加'}
        </h1>
      </header>

      {/* 写真 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          写真（最大6枚）
        </label>
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square">
              <div
                className="w-full h-full rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
          {images.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400"
            >
              <Camera className="w-8 h-8" />
              <span className="text-xs mt-1">追加</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>

      {/* タイトル */}
      <Input
        label="タイトル"
        placeholder={type === 'case' ? '例: ナチュラルボブスタイル' : '例: 年末年始の営業について'}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 施術例の場合のフィールド */}
      {type === 'case' && (
        <>
          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 所要時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所要時間
            </label>
            <div className="flex flex-wrap gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(duration === d ? undefined : d)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    duration === d
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {d}分
                </button>
              ))}
            </div>
          </div>

          {/* 価格帯 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              価格帯
            </label>
            <div className="flex gap-2">
              {priceRanges.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriceRange(priceRange === p.value ? undefined : p.value as 1 | 2 | 3)}
                  className={`px-6 py-2 rounded-lg text-sm transition-colors ${
                    priceRange === p.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* お知らせの場合のフィールド */}
      {type === 'news' && (
        <>
          {/* 種類 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              種類
            </label>
            <div className="flex flex-wrap gap-2">
              {newsTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setNewsType(t.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    newsType === t.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 表示期間 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="表示開始"
              type="date"
              value={displayStart}
              onChange={(e) => setDisplayStart(e.target.value)}
            />
            <Input
              label="表示終了"
              type="date"
              value={displayEnd}
              onChange={(e) => setDisplayEnd(e.target.value)}
            />
          </div>
        </>
      )}

      {/* 本文 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          本文
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px]"
          placeholder="施術のポイントやこだわりを書いてみましょう"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* フッター */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4" style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 64px), 80px)' }}>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex-1"
          >
            下書き保存
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex-1"
          >
            公開する
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">読み込み中...</div></div>}>
      <NewPostContent />
    </Suspense>
  );
}
