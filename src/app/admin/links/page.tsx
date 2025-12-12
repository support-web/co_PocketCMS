'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Card, Toggle } from '@/components/ui';
import { Shop, CTASettings } from '@/types';
import { Calendar, MessageCircle, Phone, Link as LinkIcon, QrCode, Copy, Check, ExternalLink, Save, GripVertical } from 'lucide-react';

export default function LinksPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  // フォーム状態
  const [reservationUrl, setReservationUrl] = useState('');
  const [lineUrl, setLineUrl] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [ctaSettings, setCtaSettings] = useState<CTASettings>({
    showReservation: true,
    showLine: true,
    showPhone: true,
    order: ['reservation', 'line', 'phone'],
  });

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
        setReservationUrl(shopData.reservationUrl || '');
        setLineUrl(shopData.lineUrl || '');
        setGoogleMapUrl(shopData.googleMapUrl || '');
        if (shopData.ctaSettings) {
          setCtaSettings(shopData.ctaSettings);
        }

        // QRコードと短縮URL取得
        generateQrAndShortUrl(shopData);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQrAndShortUrl = async (shopData: Shop) => {
    try {
      const siteUrl = `https://${shopData.subdomain}.pocketcms.jp`;

      // QRコード生成
      const qrRes = await fetch(`/api/qr?url=${encodeURIComponent(siteUrl)}`);
      const qrData = await qrRes.json();
      if (qrData.success) {
        setQrCode(qrData.data.qrCode);
      }

      // 短縮URL取得/生成
      const shortRes = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shopData.id }),
      });
      const shortData = await shortRes.json();
      if (shortData.success) {
        setShortUrl(shortData.data.shortUrl);
      }
    } catch (error) {
      console.error('Error generating QR/short URL:', error);
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
          reservationUrl,
          lineUrl,
          googleMapUrl,
          ctaSettings,
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

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const toggleCtaSetting = (key: 'showReservation' | 'showLine' | 'showPhone') => {
    setCtaSettings({ ...ctaSettings, [key]: !ctaSettings[key] });
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

  const siteUrl = `https://${shop.subdomain}.pocketcms.jp`;

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* ヘッダー */}
      <header className="py-2">
        <h1 className="text-xl font-bold">導線</h1>
        <p className="text-sm text-gray-500 mt-1">予約・LINE・電話の設定とQRコード</p>
      </header>

      {/* 固定フッターCTA設定 */}
      <Card>
        <h3 className="font-semibold mb-4">固定フッター（常時表示）</h3>
        <p className="text-sm text-gray-500 mb-4">
          サイト下部に常に表示されるボタンを設定します
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium">予約</span>
            </div>
            <Toggle
              checked={ctaSettings.showReservation}
              onChange={() => toggleCtaSetting('showReservation')}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">LINE</span>
            </div>
            <Toggle
              checked={ctaSettings.showLine}
              onChange={() => toggleCtaSetting('showLine')}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium">電話</span>
            </div>
            <Toggle
              checked={ctaSettings.showPhone}
              onChange={() => toggleCtaSetting('showPhone')}
            />
          </div>
        </div>
      </Card>

      {/* リンク設定 */}
      <Card>
        <h3 className="font-semibold mb-4">リンク設定</h3>
        <div className="space-y-4">
          <Input
            label="予約URL"
            placeholder="https://..."
            value={reservationUrl}
            onChange={(e) => setReservationUrl(e.target.value)}
          />
          <Input
            label="LINE友だち追加URL"
            placeholder="https://line.me/..."
            value={lineUrl}
            onChange={(e) => setLineUrl(e.target.value)}
          />
          <Input
            label="Googleマップ URL（任意）"
            placeholder="https://maps.google.com/..."
            value={googleMapUrl}
            onChange={(e) => setGoogleMapUrl(e.target.value)}
          />
        </div>
      </Card>

      {/* 共有 */}
      <Card>
        <h3 className="font-semibold mb-4">共有</h3>
        <div className="space-y-4">
          {/* サイトURL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              サイトURL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm truncate">
                {siteUrl}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(siteUrl, 'site')}
              >
                {copied === 'site' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
              <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>

          {/* 短縮URL */}
          {shortUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                短縮URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm truncate">
                  {shortUrl}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(shortUrl, 'short')}
                >
                  {copied === 'short' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* QRコード */}
          {qrCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QRコード
              </label>
              <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                <p className="text-sm text-gray-500 mt-2">店頭での掲示やSNSでの共有に</p>
                <a
                  href={qrCode}
                  download={`${shop.name}-qrcode.png`}
                  className="mt-3"
                >
                  <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-2" />
                    ダウンロード
                  </Button>
                </a>
              </div>
            </div>
          )}
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
