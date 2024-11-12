// app/product/[id]/page.tsx

"use client"

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
}

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/products/${params.id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('商品データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    if (!product || addingToCart) return;
    
    setAddingToCart(true);
    try {
      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          product_id: product.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('カートへの追加に失敗しました');
      }

      router.push('/cart/added');
    } catch (error) {
      console.error('カートへの追加に失敗しました:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleDirectPurchase = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    if (!product || purchasing) return;
    
    setPurchasing(true);
    try {
      // まずカートに追加
      const cartResponse = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          product_id: product.id,
          quantity: quantity,
        }),
      });

      if (!cartResponse.ok) {
        throw new Error('カートへの追加に失敗しました');
      }

      // 注文作成
      const orderResponse = await fetch('http://localhost:8000/api/orders/create', {
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

      if (!orderResponse.ok) {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">商品が見つかりません</div>
        </div>
      </div>
    );
  }

  const maxQuantity = Math.min(product.stock, 10);
  const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => i + 1);

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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 商品画像 */}
            <div>
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200 rounded-lg"/>
              )}
            </div>
            
            {/* 商品情報 */}
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {product.name}
              </h1>
              <p className="text-3xl font-bold mb-4">
                ¥{product.price.toLocaleString()}
              </p>
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">商品説明</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>
              <div className="mb-6">
                <p className="mb-2">
                  在庫数: <span className="font-bold">{product.stock}</span>
                </p>
              </div>

              {/* 数量選択 */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block font-bold mb-2">
                  数量
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="block w-24 rounded border border-gray-300 py-2 px-3"
                >
                  {quantityOptions.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                {product.stock < 1 && (
                  <p className="mt-2 text-red-600">
                    申し訳ありません。この商品は現在在庫切れです。
                  </p>
                )}
              </div>

              <button 
                className={`w-full py-3 px-6 rounded-lg font-bold mb-4 ${
                  addingToCart || product.stock < 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-500'
                }`}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock < 1}
              >
                {addingToCart ? 'カートに追加中...' : 'カートに追加'}
              </button>
              <button 
                className={`w-full py-3 px-6 rounded-lg font-bold ${
                  purchasing || product.stock < 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-orange-400 hover:bg-orange-500'
                }`}
                onClick={handleDirectPurchase}
                disabled={purchasing || product.stock < 1}
              >
                {purchasing ? '処理中...' : '今すぐ購入'}
              </button>
            </div>
          </div>
        </div>
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