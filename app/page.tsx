'use client';
import { useState } from 'react';

import CreateTournamentModal from './components/tournaments/CreateTournamentModal';
import TournamentList from './components/tournaments/TournamentList';

export default function Home() {
  // モーダルの表示/非表示を管理する状態
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // 大会リストを再読み込みするためのトリガー
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // モーダルを開く関数
  const openModal = () => setIsModalOpen(true);

  // モーダルを閉じる関数
  const closeModal = () => setIsModalOpen(false);

  // 大会作成後の処理
  const handleTournamentCreated = () => {
    // リフレッシュトリガーを増加させて大会リストを更新
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <main className="max-w-6xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">大会一覧</h1>
          <button
            onClick={openModal}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            大会を作成する
          </button>
        </div>

        {/* 大会一覧コンポーネント */}
        <div key={refreshTrigger}>
          <TournamentList />
        </div>

        {/* 大会作成モーダル */}
        <CreateTournamentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onTournamentCreated={handleTournamentCreated}
        />
      </main>
    </div>
  );
}
