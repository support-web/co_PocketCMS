'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { Shop, BusinessHour } from '@/types';
import { ChevronLeft, Save, MapPin } from 'lucide-react';

const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

const defaultBusinessHours: BusinessHour[] = dayNames.map((_, i) => ({
  dayOfWeek: i,
  isOpen: i >= 1 && i <= 6, // 月〜土をデフォルトで営業日に
  openTime: '10:00',
  closeTime: '20:00',
}));

const paymentMethods = [
  '現金', 'クレジットカード', '電子マネー', 'QRコード決済', 'PayPay', '交通系IC',
];

export default function ShopEditPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // フォーム状態
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(defaultBusinessHours);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [parking, setParking] = useState('');

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
        setPhone(shopData.phone || '');
        setAddress(shopData.address || '');
        if (shopData.businessHours?.length > 0) {
          setBusinessHours(shopData.businessHours);
        }
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
          phone,
          address,
          businessHours,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/pages');
      }
    } catch (error) {
      console.error('Error saving shop:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateBusinessHour = (index: number, field: keyof BusinessHour, value: boolean | string) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  const togglePayment = (method: string) => {
    setSelectedPayments((prev) =>
      prev.includes(method) ? prev.filter((p) => p !== method) : [...prev, method]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 py-2">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">店舗情報</h1>
      </header>

      {/* 基本情報 */}
      <Card>
        <h3 className="font-semibold mb-4">基本情報</h3>
        <div className="space-y-4">
          <Input
            label="店舗名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="電話番号"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div>
            <Input
              label="住所"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button className="flex items-center gap-2 text-primary-500 text-sm mt-2">
              <MapPin className="w-4 h-4" />
              地図で確認
            </button>
          </div>
        </div>
      </Card>

      {/* 営業時間 */}
      <Card>
        <h3 className="font-semibold mb-4">営業時間</h3>
        <div className="space-y-3">
          {businessHours.map((hour, index) => (
            <div key={hour.dayOfWeek} className="flex items-center gap-3">
              <span className="w-8 text-center font-medium">{dayNames[hour.dayOfWeek]}</span>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hour.isOpen}
                  onChange={(e) => updateBusinessHour(index, 'isOpen', e.target.checked)}
                  className="w-5 h-5 text-primary-500 rounded"
                />
              </label>
              {hour.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={hour.openTime || '10:00'}
                    onChange={(e) => updateBusinessHour(index, 'openTime', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">〜</span>
                  <input
                    type="time"
                    value={hour.closeTime || '20:00'}
                    onChange={(e) => updateBusinessHour(index, 'closeTime', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              ) : (
                <span className="text-gray-400 text-sm">定休日</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 支払い方法 */}
      <Card>
        <h3 className="font-semibold mb-4">支払い方法</h3>
        <div className="flex flex-wrap gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method}
              onClick={() => togglePayment(method)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedPayments.includes(method)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </Card>

      {/* 駐車場 */}
      <Card>
        <h3 className="font-semibold mb-4">駐車場</h3>
        <Input
          placeholder="例: 店舗前に3台分あり"
          value={parking}
          onChange={(e) => setParking(e.target.value)}
        />
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
