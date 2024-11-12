// app/cart/added/page.tsx

"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartAdded() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth/login');
    }
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
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-6">
              カートに商品が追加されました
            </h1>
            <div className="space-y-4">
              <button
                onClick={() => router.push("/cart")}
                className="w-full bg-yellow-400 hover:bg-yellow-500 py-3 px-6 rounded-lg font-bold"
              >
                カートを確認する
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 hover:bg-gray-300 py-3 px-6 rounded-lg font-bold"
              >
                買い物を続ける
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