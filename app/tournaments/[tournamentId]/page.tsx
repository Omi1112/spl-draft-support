'use client';

import Link from 'next/link';
import React from 'react';

import { useTournamentDetail } from '../../hooks/useTournamentDetail';
import { TournamentParticipant } from '@/app/api/core/domain/entities/TournamentParticipant';
import TournamentParticipantList from './components/TournamentParticipantList';

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = React.use(params);
  const { tournament, participants, loading, error, onAddParticipant, onMakeCaptain } =
    useTournamentDetail(tournamentId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!tournament) return <div>トーナメントが見つかりません</div>;

  // ParticipantList用に型変換（weapon/xpはダミー値）
  const participantsForList = participants.map((p) => ({
    ...p,
    weapon: '未設定', // ダミー
    xp: 0, // ダミー
  }));

  return (
    <main>
      <h1>{tournament.name} の詳細</h1>
      <div>作成日: {tournament.createdAt}</div>
      {/* 参加者一覧をParticipantListで表示 */}
      <TournamentParticipantList
        tournamentId={tournament.id}
        participants={participantsForList}
        onCaptainToggle={onMakeCaptain}
        onAddParticipant={() => {}}
        processingCaptainId={null}
      />
      <form onSubmit={onAddParticipant} style={{ marginTop: 16 }}>
        <input name="participantName" type="text" placeholder="参加者名" required />
        <button type="submit">参加者追加</button>
      </form>
    </main>
  );
}
