'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { MenuCategory, Menu } from '@/types';
import { Plus, Edit2, Trash2, ChevronLeft, Save } from 'lucide-react';

export default function MenuEditPage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string>('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  useEffect(() => {
    fetchShopAndMenus();
  }, []);

  const fetchShopAndMenus = async () => {
    try {
      const shopsRes = await fetch('/api/shops');
      const shopsData = await shopsRes.json();
      if (shopsData.success && shopsData.data.length > 0) {
        const id = shopsData.data[0].id;
        setShopId(id);

        const menusRes = await fetch(`/api/menus?shopId=${id}`);
        const menusData = await menusRes.json();
        if (menusData.success) {
          setCategories(menusData.data.categories);
          setMenus(menusData.data.menus);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || !shopId) return;

    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          shopId,
          name: newCategoryName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setNewCategoryName('');
        setShowAddCategory(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('このカテゴリとメニューを削除しますか?')) return;

    try {
      await fetch(`/api/menus?id=${id}&type=category`, { method: 'DELETE' });
      setCategories(categories.filter((c) => c.id !== id));
      setMenus(menus.filter((m) => m.categoryId !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addMenu = async (categoryId: string) => {
    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          categoryId,
          name: '新規メニュー',
          price: 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMenus([...menus, data.data]);
        setEditingMenu(data.data);
      }
    } catch (error) {
      console.error('Error adding menu:', error);
    }
  };

  const updateMenu = async () => {
    if (!editingMenu) return;

    try {
      const res = await fetch('/api/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMenu),
      });
      const data = await res.json();
      if (data.success) {
        setMenus(menus.map((m) => (m.id === editingMenu.id ? data.data : m)));
        setEditingMenu(null);
      }
    } catch (error) {
      console.error('Error updating menu:', error);
    }
  };

  const deleteMenu = async (id: string) => {
    if (!confirm('このメニューを削除しますか?')) return;

    try {
      await fetch(`/api/menus?id=${id}`, { method: 'DELETE' });
      setMenus(menus.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting menu:', error);
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
        <h1 className="text-xl font-bold">メニュー/料金</h1>
      </header>

      {/* カテゴリとメニュー */}
      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => addMenu(category.id)}
                  className="p-2 text-primary-500"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {menus
                .filter((m) => m.categoryId === category.id)
                .map((menu) => (
                  <div
                    key={menu.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{menu.name}</p>
                      <div className="flex gap-3 text-sm text-gray-500 mt-1">
                        <span>¥{menu.price.toLocaleString()}</span>
                        {menu.duration && <span>{menu.duration}分</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMenu(menu)}
                        className="p-2 text-gray-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMenu(menu.id)}
                        className="p-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

              {menus.filter((m) => m.categoryId === category.id).length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  メニューがありません
                </p>
              )}
            </div>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">カテゴリがありません</p>
          </div>
        )}
      </div>

      {/* カテゴリ追加 */}
      {showAddCategory ? (
        <Card>
          <div className="flex gap-3">
            <Input
              placeholder="カテゴリ名"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addCategory}>追加</Button>
            <Button variant="secondary" onClick={() => setShowAddCategory(false)}>
              キャンセル
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          fullWidth
          onClick={() => setShowAddCategory(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          カテゴリを追加
        </Button>
      )}

      {/* メニュー編集モーダル */}
      {editingMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-4 space-y-4 pb-8">
            <h3 className="font-semibold text-lg">メニューを編集</h3>
            <Input
              label="メニュー名"
              value={editingMenu.name}
              onChange={(e) =>
                setEditingMenu({ ...editingMenu, name: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="価格"
                type="number"
                value={editingMenu.price}
                onChange={(e) =>
                  setEditingMenu({ ...editingMenu, price: parseInt(e.target.value) || 0 })
                }
              />
              <Input
                label="所要時間（分）"
                type="number"
                value={editingMenu.duration || ''}
                onChange={(e) =>
                  setEditingMenu({
                    ...editingMenu,
                    duration: parseInt(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <Input
              label="説明（任意）"
              value={editingMenu.description || ''}
              onChange={(e) =>
                setEditingMenu({ ...editingMenu, description: e.target.value })
              }
            />
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setEditingMenu(null)}
                fullWidth
              >
                キャンセル
              </Button>
              <Button onClick={updateMenu} fullWidth>
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
