// トーナメント一覧表示コンポーネント
// strictな型チェック・null/undefined安全・日本語コメント
import React, { useEffect, useState } from 'react';

import { fetchTournaments } from '@/app/client/tournament/fetchTournaments';
import { Tournament } from '@/app/client/tournament/types';

// トーナメント一覧表示用コンポーネント
export const TournamentList: React.FC = () => {
  // トーナメント一覧の状態
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 初回マウント時に一覧取得
  useEffect(() => {
    fetchTournaments()
      .then((data) => {
        setTournaments(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message ?? '不明なエラー');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!tournaments.length) return <div>トーナメントはありません</div>;

  return (
    <ul>
      {tournaments.map((t) => (
        <li key={t.id}>
          {t.name}（作成日: {new Date(t.createdAt).toLocaleString()}）
        </li>
      ))}
    </ul>
  );
};
