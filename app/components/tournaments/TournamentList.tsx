// app/components/tournaments/TournamentList.tsx
// 大会一覧表示コンポーネント
import React, { useEffect, useState } from 'react';
import { fetchTournaments, Tournament } from '@/app/client/tournament/fetchTournaments';
import TournamentCard from './TournamentCard';

/**
 * 大会一覧を表示するコンポーネント
 */
const TournamentList: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTournaments()
      .then((data) => {
        setTournaments(data);
        setError(null);
      })
      .catch((e) => {
        setError(e.message ?? '大会一覧の取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  if (!tournaments.length) {
    return <div className="text-center py-8 text-gray-400">大会がありません</div>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
      {tournaments.map((t) => (
        <TournamentCard key={t.id} tournament={t} />
      ))}
    </div>
  );
};

export default TournamentList;
