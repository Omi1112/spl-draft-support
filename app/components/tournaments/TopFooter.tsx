// app/components/tournaments/TopFooter.tsx
// TOPページ用フッターコンポーネント
import React from 'react';

const TopFooter: React.FC = () => (
  <footer className="w-full py-4 px-6 bg-gray-100 text-gray-500 text-center text-xs mt-8 border-t">
    &copy; {new Date().getFullYear()} 大会管理システム
  </footer>
);

export default TopFooter;
