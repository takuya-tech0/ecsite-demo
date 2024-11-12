// app/pages/auth/LoginPage.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('ログインに失敗しました');
      }

      const data = await response.json();
      localStorage.setItem('userId', data.userId);
      router.push('/');
    } catch (err) {
      setError('ログインに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10">
      <h1 className="text-2xl font-bold mb-8 text-[#232F3E]">ECサイト</h1>
      
      <div className="w-[350px] border border-gray-300 rounded-lg p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#FF9900]"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#FF9900]"
            required
          />
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button 
            type="submit"
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-sm py-2 px-4 rounded-lg border border-[#FCD200] shadow-sm"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;