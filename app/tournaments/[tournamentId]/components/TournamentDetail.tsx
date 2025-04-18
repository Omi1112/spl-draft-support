// トーナメント詳細画面UIの実装
// strictな型チェック・null/undefined安全・日本語コメント
import React, { useEffect, useState } from 'react';

import {
  fetchTournamentParticipants,
  TournamentParticipant,
} from '@/app/client/tournament/fetchTournamentParticipants';

// props型定義
type Props = {
  tournamentId: string;
};

export const TournamentDetail: React.FC<Props> = ({ tournamentId }) => {
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournamentParticipants(tournamentId)
      .then((data) => {
        setParticipants(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message ?? '不明なエラー');
        setLoading(false);
      });
  }, [tournamentId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      <h2>参加者一覧</h2>
      <ul>
        {participants.map((p) => (
          <li key={p.id}>
            {p.Participant?.name ?? '不明'}（XP: {p.Participant?.xp ?? '-'}）
            {p.isCaptain && <span> [キャプテン]</span>}
            {/* キャプテンの場合にキャプテン詳細ページへのリンクを表示 */}
            {p.isCaptain && (
              <a
                href={`/tournaments/${p.tournamentId}/captains/${p.participantId}`}
                style={{ marginLeft: 8 }}
              >
                キャプテン詳細へ
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
