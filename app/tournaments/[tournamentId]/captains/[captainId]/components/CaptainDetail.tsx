// キャプテン詳細画面UIの実装
// strictな型チェック・null/undefined安全・日本語コメント
import React, { useEffect, useState } from 'react';

import { fetchCaptainDetail } from '@/app/client/captain/fetchCaptainDetail';
import { fetchNominatableTournamentParticipants } from '@/app/client/captain/fetchNominatableTournamentParticipants';
import { nominateParticipant } from '@/app/client/captain/nominateParticipant';
import { resetDraft } from '@/app/client/captain/resetDraft';
import { startDraft } from '@/app/client/captain/startDraft';
import { TournamentParticipant } from '@/app/client/captain/types';

// props型定義
type Props = {
  tournamentId: string;
  participantId: string;
};

export const CaptainDetail: React.FC<Props> = ({ tournamentId, participantId }) => {
  const [captain, setCaptain] = useState<TournamentParticipant | null>(null);
  const [tournamentParticipants, setTournamentParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftStarted, setDraftStarted] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCaptainDetail(tournamentId, participantId),
      fetchNominatableTournamentParticipants(tournamentId),
    ])
      .then(([captain, nominatable]) => {
        setCaptain(captain as TournamentParticipant); // 型安全のためキャスト
        setTournamentParticipants(nominatable);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message ?? '不明なエラー');
        setLoading(false);
      });
  }, [tournamentId, participantId]);

  const handleStartDraft = async () => {
    setError(null);
    try {
      await startDraft(tournamentId);
      setDraftStarted(true);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? 'ドラフト開始に失敗しました');
      } else {
        setError('ドラフト開始に失敗しました');
      }
    }
  };

  const handleResetDraft = async () => {
    setError(null);
    try {
      await resetDraft(tournamentId);
      setDraftStarted(false);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? 'リセットに失敗しました');
      } else {
        setError('リセットに失敗しました');
      }
    }
  };

  const handleNominate = async (participantId: string) => {
    setError(null);
    try {
      if (!captain) throw new Error('キャプテン情報がありません');
      await nominateParticipant({ tournamentId, captainId: captain.id, participantId });
      setTournamentParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? '指名に失敗しました');
      } else {
        setError('指名に失敗しました');
      }
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      <h2>キャプテン詳細</h2>
      <div>キャプテン: {captain?.participant?.name ?? '未設定'}</div>
      <button onClick={handleStartDraft} disabled={draftStarted}>
        ドラフト開始
      </button>
      {draftStarted && <button onClick={handleResetDraft}>リセット</button>}
      <h3>指名可能な参加者</h3>
      <ul>
        {tournamentParticipants.map((tp) => (
          <li key={tp.participant.id}>
            {tp.participant.name}（XP: {tp.participant.xp}）
            <button onClick={() => handleNominate(tp.participant.id)}>指名</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
