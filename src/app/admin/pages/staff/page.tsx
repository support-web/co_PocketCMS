'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { Staff } from '@/types';
import { ChevronLeft, Plus, Edit2, Trash2, Camera, Save, User } from 'lucide-react';

export default function StaffEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shopId, setShopId] = useState<string>('');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

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

        const staffRes = await fetch(`/api/staff?shopId=${id}`);
        const staffData = await staffRes.json();
        if (staffData.success) {
          setStaffList(staffData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async () => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          name: '新しいスタッフ',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList([...staffList, data.data]);
        setEditingStaff(data.data);
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const updateStaff = async () => {
    if (!editingStaff) return;

    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStaff),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(staffList.map((s) => (s.id === editingStaff.id ? data.data : s)));
        setEditingStaff(null);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm('このスタッフを削除しますか?')) return;

    try {
      await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      setStaffList(staffList.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStaff) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditingStaff({ ...editingStaff, image: event.target.result as string });
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

  return (
    <div className="p-4 space-y-4">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 py-2">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">スタッフ</h1>
      </header>

      {/* スタッフ一覧 */}
      <div className="space-y-3">
        {staffList.map((staff) => (
          <Card key={staff.id} className="flex items-center gap-4">
            {staff.image ? (
              <div
                className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${staff.image})` }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{staff.name}</p>
              {staff.role && (
                <p className="text-sm text-gray-500">{staff.role}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingStaff(staff)}
                className="p-2 text-gray-500"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteStaff(staff.id)}
                className="p-2 text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </Card>
        ))}

        {staffList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">スタッフがまだ登録されていません</p>
          </div>
        )}
      </div>

      {/* 追加ボタン */}
      <Button variant="outline" fullWidth onClick={addStaff}>
        <Plus className="w-5 h-5 mr-2" />
        スタッフを追加
      </Button>

      {/* 編集モーダル */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-4 space-y-4 pb-8">
            <h3 className="font-semibold text-lg">スタッフを編集</h3>

            {/* 写真 */}
            <div className="flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative"
              >
                {editingStaff.image ? (
                  <div
                    className="w-24 h-24 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${editingStaff.image})` }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <Input
              label="名前"
              value={editingStaff.name}
              onChange={(e) =>
                setEditingStaff({ ...editingStaff, name: e.target.value })
              }
            />
            <Input
              label="役職（任意）"
              placeholder="例: スタイリスト、オーナー"
              value={editingStaff.role || ''}
              onChange={(e) =>
                setEditingStaff({ ...editingStaff, role: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                紹介文（任意）
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                placeholder="得意なスタイルや趣味など"
                value={editingStaff.description || ''}
                onChange={(e) =>
                  setEditingStaff({ ...editingStaff, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setEditingStaff(null)}
                fullWidth
              >
                キャンセル
              </Button>
              <Button onClick={updateStaff} fullWidth>
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
