import React, { useState } from 'react';

import { TournamentCreateModal } from '@/app/tournaments/components/TournamentCreateModal';
import { TournamentList } from '@/app/tournaments/components/TournamentList';

// TOPページのトーナメント作成フロー結合用コンテナ
export const TournamentTopContainer: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // トーナメント作成後に一覧をリフレッシュ
  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>トーナメント作成</button>
      <TournamentCreateModal
        isOpen={modalOpen}
        onCreated={handleCreated}
        onClose={() => setModalOpen(false)}
      />
      {/* refreshKeyをkeyに渡すことで再マウント→再取得 */}
      <TournamentList key={refreshKey} />
    </div>
  );
};
