// app/orders/page.tsx

"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderDetail {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  product_image_url: string | null;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  details: OrderDetail[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/orders?user_id=${userId}`);
        if (!res.ok) throw new Error('注文履歴の取得に失敗しました');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('注文履歴の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

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
        <h1 className="text-2xl font-bold mb-6">注文履歴</h1>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <p className="text-xl mb-4">注文履歴がありません</p>
              <button
                onClick={() => router.push("/")}
                className="bg-yellow-400 hover:bg-yellow-500 py-3 px-6 rounded-lg font-bold"
              >
                商品一覧に戻る
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        注文番号: {order.order_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        注文日: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-lg font-bold">
                      ¥{order.total_amount.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {order.details.map((detail) => (
                    <div key={detail.id} className="flex gap-4">
                      {detail.product_image_url ? (
                        <img
                          src={detail.product_image_url}
                          alt={detail.product_name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded" />
                      )}
                      <div>
                        <p className="font-bold">{detail.product_name}</p>
                        <p className="text-gray-600">
                          数量: {detail.quantity}
                        </p>
                        <p className="text-gray-600">
                          単価: ¥{detail.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                <li className="hover:text-gray-300 cursor-pointer">
                  お問い合わせ
                </li>
                <li className="hover:text-gray-300 cursor-pointer">
                  返品・交換
                </li>
                <li className="hover:text-gray-300 cursor-pointer">
                  配送について
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">会社情報</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-300 cursor-pointer">会社概要</li>
                <li className="hover:text-gray-300 cursor-pointer">採用情報</li>
                <li className="hover:text-gray-300 cursor-pointer">
                  プレスリリース
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">ヘルプ</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-300 cursor-pointer">
                  よくある質問
                </li>
                <li className="hover:text-gray-300 cursor-pointer">
                  使い方ガイド
                </li>
                <li className="hover:text-gray-300 cursor-pointer">
                  サイトマップ
                </li>
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