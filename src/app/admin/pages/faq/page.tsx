'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { FAQ } from '@/types';
import { ChevronLeft, Plus, Edit2, Trash2, Save, HelpCircle } from 'lucide-react';

const faqTemplates = [
  { question: '予約は必要ですか?', answer: 'はい、ご予約をおすすめしております。お電話またはLINEからご予約いただけます。' },
  { question: '駐車場はありますか?', answer: '' },
  { question: 'クレジットカードは使えますか?', answer: '' },
  { question: '当日予約はできますか?', answer: '空きがあれば可能です。お気軽にお問い合わせください。' },
  { question: 'キャンセル料はかかりますか?', answer: '' },
];

export default function FAQEditPage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string>('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const shopsRes = await fetch('/api/shops');
      const shopsData = await shopsRes.json();
      if (shopsData.success && shopsData.data.length > 0) {
        const id = shopsData.data[0].id;
        setShopId(id);

        const faqsRes = await fetch(`/api/faqs?shopId=${id}`);
        const faqsData = await faqsRes.json();
        if (faqsData.success) {
          setFaqs(faqsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFaq = async (question = '', answer = '') => {
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          question: question || '新しい質問',
          answer: answer || '回答を入力してください',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs([...faqs, data.data]);
        if (!question) {
          setEditingFaq(data.data);
        }
        setShowTemplates(false);
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
    }
  };

  const updateFaq = async () => {
    if (!editingFaq) return;

    try {
      const res = await fetch('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaq),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(faqs.map((f) => (f.id === editingFaq.id ? data.data : f)));
        setEditingFaq(null);
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('このFAQを削除しますか?')) return;

    try {
      await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
      setFaqs(faqs.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

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
      <header className="flex items-center gap-3 py-2">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">よくある質問</h1>
      </header>

      {/* FAQ一覧 */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{faq.question}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingFaq(faq)}
                  className="p-2 text-gray-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFaq(faq.id)}
                  className="p-2 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">FAQがまだ登録されていません</p>
          </div>
        )}
      </div>

      {/* 追加ボタン */}
      <div className="space-y-2">
        <Button variant="outline" fullWidth onClick={() => setShowTemplates(!showTemplates)}>
          <Plus className="w-5 h-5 mr-2" />
          テンプレートから追加
        </Button>
        <Button variant="secondary" fullWidth onClick={() => addFaq()}>
          <Plus className="w-5 h-5 mr-2" />
          自由に追加
        </Button>
      </div>

      {/* テンプレート選択 */}
      {showTemplates && (
        <Card>
          <h3 className="font-semibold mb-3">よく使われる質問</h3>
          <div className="space-y-2">
            {faqTemplates.map((template, i) => (
              <button
                key={i}
                onClick={() => addFaq(template.question, template.answer)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-sm">{template.question}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* 編集モーダル */}
      {editingFaq && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-4 space-y-4 pb-8">
            <h3 className="font-semibold text-lg">FAQを編集</h3>
            <Input
              label="質問"
              value={editingFaq.question}
              onChange={(e) =>
                setEditingFaq({ ...editingFaq, question: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                回答
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                value={editingFaq.answer}
                onChange={(e) =>
                  setEditingFaq({ ...editingFaq, answer: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setEditingFaq(null)}
                fullWidth
              >
                キャンセル
              </Button>
              <Button onClick={updateFaq} fullWidth>
                <Save className="w-5 h-5 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
