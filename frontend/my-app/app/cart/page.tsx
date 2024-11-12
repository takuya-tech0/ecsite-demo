// app/cart/page.tsx

"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  total_price: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/cart/items?user_id=${userId}`);
        if (!res.ok) throw new Error('カートの取得に失敗しました');
        const data = await res.json();
        setCartItems(data);
      } catch (error) {
        console.error('カートの商品取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [router]);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (!response.ok) throw new Error('数量の更新に失敗しました');
      
      const res = await fetch(`http://localhost:8000/api/cart/items?user_id=${userId}`);
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('数量の更新に失敗しました:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('商品の削除に失敗しました');
      
      const res = await fetch(`http://localhost:8000/api/cart/items?user_id=${userId}`);
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('商品の削除に失敗しました:', error);
    }
  };

  const handlePurchase = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    if (cartItems.length === 0 || purchasing) return;

    setPurchasing(true);
    try {
      // 注文作成
      const response = await fetch('http://localhost:8000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          payment_method: 'credit_card',
          shipping_name: '山田太郎', // TODO: これらの情報は実際にはフォームから取得
          shipping_postal_code: '123-4567',
          shipping_address: '東京都渋谷区...',
          shipping_phone: '03-1234-5678'
        }),
      });

      if (!response.ok) {
        throw new Error('注文の作成に失敗しました');
      }

      // サンクスページへ遷移
      router.push('/order/thanks');
    } catch (error) {
      console.error('購入処理に失敗しました:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold cursor-pointer" 
              onClick={() => router.push("/")}
            >
              ECサイト
            </h1>
            <div className="flex items-center gap-6">
            <button 
              className="hover:text-gray-300 transition-colors"
              onClick={() => router.push('/cart')}
            > 
              🛒
              </button>
              <button 
                className="hover:text-gray-300 transition-colors"
                onClick={() => router.push('/order')}
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ショッピングカート</h1>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <p className="text-xl mb-4">カートに商品がありません</p>
              <button
                onClick={() => router.push("/")}
                className="bg-yellow-400 hover:bg-yellow-500 py-3 px-6 rounded-lg font-bold"
              >
                商品一覧に戻る
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 商品一覧 */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 border-b last:border-b-0">
                    <div className="flex gap-4">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded" />
                      )}
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold">
                          {item.name}
                        </h3>
                        <p className="text-lg font-bold">
                          ¥{item.price.toLocaleString()}
                        </p>
                        {item.stock > 0 ? (
                          <p className="text-sm text-green-600">在庫あり</p>
                        ) : (
                          <p className="text-sm text-red-600">在庫切れ</p>
                        )}
                        <div className="mt-2 flex items-center gap-4">
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="border rounded px-2 py-1"
                            disabled={item.stock === 0}
                          >
                            {[...Array(Math.min(10, item.stock))].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ¥{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 注文サマリー */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <div className="mb-4">
                <div className="text-lg">
                  小計 ({totalItems}点):
                  <span className="font-bold ml-2">
                    ¥{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePurchase}
                disabled={cartItems.length === 0 || purchasing}
                className={`w-full py-3 px-6 rounded-lg font-bold ${
                  cartItems.length === 0 || purchasing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-orange-400 hover:bg-orange-500'
                }`}
              >
                {purchasing ? '処理中...' : '購入する'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">カスタマーサービス</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-300 cursor-pointer">お問い合わせ</li>
                <li className="hover:text-gray-300 cursor-pointer">返品・交換</li>
                <li className="hover:text-gray-300 cursor-pointer">配送について</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">会社情報</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-300 cursor-pointer">会社概要</li>
                <li className="hover:text-gray-300 cursor-pointer">採用情報</li>
                <li className="hover:text-gray-300 cursor-pointer">プレスリリース</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">ヘルプ</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-300 cursor-pointer">よくある質問</li>
                <li className="hover:text-gray-300 cursor-pointer">使い方ガイド</li>
                <li className="hover:text-gray-300 cursor-pointer">サイトマップ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">SNS</h4>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600">
                  F
                </button>
                <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600">
                  T
                </button>
                <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600">
                  I
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 py-4">
          <div className="container mx-auto px-4 text-center text-sm">
            © 2024 ECサイト. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}