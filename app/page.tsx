// "use client" を追加
'use client';
// app/page.tsx
// TOPページのレイアウトと統合ポイント
import React, { useState } from 'react';
import TopHeader from '@/app/components/tournaments/TopHeader';
import TopFooter from '@/app/components/tournaments/TopFooter';
import TournamentList from '@/app/components/tournaments/TournamentList';
import CreateTournamentModal from '@/app/components/tournaments/CreateTournamentModal';

const TopPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 大会作成後の一覧リフレッシュ
  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <TopHeader />
      <main className="flex-1 flex flex-col items-center px-2 py-6 w-full max-w-7xl mx-auto">
        <div className="w-full flex justify-end mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
            onClick={() => setModalOpen(true)}
          >
            + 大会作成
          </button>
        </div>
        {/* keyでリフレッシュ制御 */}
        <div className="w-full">
          <TournamentList key={refreshKey} />
        </div>
        <CreateTournamentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      </main>
      <TopFooter />
    </div>
  );
};

export default TopPage;
