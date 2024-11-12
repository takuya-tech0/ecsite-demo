// app/order/thanks/page.tsx

"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderThanks() {
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
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl font-bold mb-4">
            ご注文ありがとうございます！
          </h1>
          <p className="text-gray-600 mb-8">
            ご注文の確認メールをお送りしました。
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push("/order")}
              className="block w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700"
            >
              注文履歴を確認する
            </button>
            <button
              onClick={() => router.push("/")}
              className="block w-full bg-white border border-gray-300 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-50"
            >
              ショッピングを続ける
            </button>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-12">
        {/* フッターの内容は他のページと同じ */}
      </footer>
    </div>
  );
}