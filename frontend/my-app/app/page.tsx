"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
}

interface Category {
  id: number;
  name: string;
}

export default function ECSite() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productsRes = await fetch('http://localhost:8000/api/products');
        const productsData = await productsRes.json();
        setFeaturedProducts(productsData.slice(0, 5));

        const categoriesRes = await fetch('http://localhost:8000/api/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAEDED]">
        <div className="text-xl text-[#232F3E]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
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
        {/* おすすめ商品 */}
        <section className="mb-12">
          <h2 className="text-2xl font-medium text-[#232F3E] mb-6">
            おすすめ商品
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {featuredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                {product.image_url ? (
                  <div className="relative aspect-square cursor-pointer">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity"/>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gray-100"/>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-[#0F1111] mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <p className="text-lg text-[#0F1111] font-bold">¥{product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* カテゴリー一覧 */}
        <section>
          <h2 className="text-2xl font-medium text-[#232F3E] mb-6">
            カテゴリー
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="bg-white p-6 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/category/${category.id}`)}
              >
                <div className="w-16 h-16 bg-[#EAEDED] rounded-full mx-auto mb-4"/>
                <h3 className="text-center text-[#0F1111] font-medium">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="mt-12">
        <div className="bg-[#232F3E] text-white py-12">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">カスタマーサービス</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">お問い合わせ</li>
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">返品・交換</li>
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">配送について</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">会社情報</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">会社概要</li>
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">採用情報</li>
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">プレスリリース</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">ヘルプ</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">よくある質問</li>
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">使い方ガイド</li>
                <li className="hover:text-[#FF9900] cursor-pointer transition-colors">サイトマップ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">SNS</h4>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-[#37475A] rounded-full flex items-center justify-center hover:bg-[#FF9900] transition-colors">
                  F
                </button>
                <button className="w-10 h-10 bg-[#37475A] rounded-full flex items-center justify-center hover:bg-[#FF9900] transition-colors">
                  T
                </button>
                <button className="w-10 h-10 bg-[#37475A] rounded-full flex items-center justify-center hover:bg-[#FF9900] transition-colors">
                  I
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#131A22] text-white py-4 text-center text-sm">
          <div className="container mx-auto px-4">
            © 2024 ECサイト. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
