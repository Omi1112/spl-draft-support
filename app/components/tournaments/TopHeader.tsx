// app/components/tournaments/TopHeader.tsx
// TOPページ用ヘッダーコンポーネント
import React from 'react';

const TopHeader: React.FC = () => (
  <header className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 to-blue-400 text-white shadow-md flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">大会管理システム</h1>
    <nav>{/* 必要に応じてナビゲーション追加 */}</nav>
  </header>
);

export default TopHeader;
