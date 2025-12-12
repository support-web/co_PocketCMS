'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, RadioGroup } from '@/components/ui';
import { BusinessType, OnboardingState } from '@/types';

const businessTypes = [
  { value: 'beauty', label: '美容室', description: 'ヘアカット、カラー、パーマなど' },
  { value: 'nail', label: 'ネイルサロン', description: 'ネイルアート、ジェルネイルなど' },
  { value: 'eyelash', label: 'まつげサロン', description: 'まつげパーマ、エクステなど' },
  { value: 'bodywork', label: '整体・マッサージ', description: '整体、骨盤矯正、マッサージなど' },
  { value: 'gym', label: 'パーソナルジム', description: 'パーソナルトレーニング、フィットネスなど' },
  { value: 'other', label: 'その他', description: '上記以外のサービス' },
];

const reservationMethods = [
  { value: 'all', label: '3つ全部（おすすめ）', description: '予約URL、LINE、電話すべてで予約を受け付け' },
  { value: 'url', label: '予約URLを貼る', description: 'ホットペッパーなど外部予約サイトのURLを使用' },
  { value: 'line', label: 'LINEで受付', description: 'LINE公式アカウントで予約を受け付け' },
  { value: 'phone', label: '電話で受付', description: '電話での予約を受け付け' },
];

const templates = [
  { value: 'beauty', label: '美容向けテンプレート' },
  { value: 'bodywork', label: '整体向けテンプレート' },
];

const brandColors = [
  { value: '#0ea5e9', label: 'ブルー' },
  { value: '#10b981', label: 'グリーン' },
  { value: '#f59e0b', label: 'オレンジ' },
  { value: '#ec4899', label: 'ピンク' },
  { value: '#8b5cf6', label: 'パープル' },
  { value: '#6b7280', label: 'グレー' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<OnboardingState>({
    step: 0,
    businessType: undefined,
    basicInfo: undefined,
    reservationSettings: undefined,
    designSettings: undefined,
  });

  // 業種選択
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');

  // 基本情報
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // 予約導線
  const [reservationMethod, setReservationMethod] = useState('all');
  const [reservationUrl, setReservationUrl] = useState('');
  const [lineUrl, setLineUrl] = useState('');

  // デザイン
  const [template, setTemplate] = useState('beauty');
  const [brandColor, setBrandColor] = useState('#0ea5e9');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shopName,
          businessType,
          phone,
          address,
          reservationUrl: reservationMethod === 'url' || reservationMethod === 'all' ? reservationUrl : null,
          lineUrl: reservationMethod === 'line' || reservationMethod === 'all' ? lineUrl : null,
          brandColor,
          template,
        }),
      });

      if (response.ok) {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error creating shop:', error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!businessType;
      case 1:
        return !!shopName && !!phone && !!address;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-500">PocketCMS</h1>
          <span className="text-sm text-gray-500">ステップ {step + 1} / 4</span>
        </div>
        {/* プログレスバー */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </header>

      {/* コンテンツ */}
      <main className="p-4 pb-32">
        {/* Step 0: 業種選択 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">あなたの業種は?</h2>
              <p className="text-gray-500 mt-2">業種に合ったテンプレートをご用意します</p>
            </div>
            <RadioGroup
              name="businessType"
              value={businessType}
              onChange={(v) => setBusinessType(v as BusinessType)}
              options={businessTypes}
            />
          </div>
        )}

        {/* Step 1: 基本情報 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">基本情報</h2>
              <p className="text-gray-500 mt-2">お店の基本情報を入力してください</p>
            </div>
            <div className="space-y-4">
              <Input
                label="店舗名"
                placeholder="例: サロン〇〇"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
              <Input
                label="電話番号"
                type="tel"
                placeholder="例: 03-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="住所"
                placeholder="例: 東京都渋谷区..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: 予約導線 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">予約方法を選択</h2>
              <p className="text-gray-500 mt-2">お客様がどの方法で予約できるか設定します</p>
            </div>
            <RadioGroup
              name="reservationMethod"
              value={reservationMethod}
              onChange={setReservationMethod}
              options={reservationMethods}
            />
            {(reservationMethod === 'url' || reservationMethod === 'all') && (
              <Input
                label="予約URL（任意）"
                placeholder="https://..."
                value={reservationUrl}
                onChange={(e) => setReservationUrl(e.target.value)}
              />
            )}
            {(reservationMethod === 'line' || reservationMethod === 'all') && (
              <Input
                label="LINE友だち追加URL（任意）"
                placeholder="https://line.me/..."
                value={lineUrl}
                onChange={(e) => setLineUrl(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Step 3: デザイン */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">デザインを選択</h2>
              <p className="text-gray-500 mt-2">テンプレートとブランドカラーを選んでください</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  テンプレート
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTemplate(t.value)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        template === t.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="h-20 bg-gray-100 rounded mb-2" />
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ブランドカラー
                </label>
                <div className="flex flex-wrap gap-3">
                  {brandColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setBrandColor(c.value)}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        brandColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* フッター（ナビゲーションボタン） */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              戻る
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {step === 3 ? '公開する' : '次へ'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
