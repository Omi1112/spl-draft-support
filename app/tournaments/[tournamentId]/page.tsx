'use client';

import Link from 'next/link';
import React from 'react';
import { useTournamentDetail } from '../../hooks/useTournamentDetail';
import { TournamentParticipant } from '@/app/api/core/domain/entities/TournamentParticipant';
import TournamentParticipantList from './components/TournamentParticipantList';
import styles from './page.module.css';

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = React.use(params);
  const { tournament, participants, loading, error, onAddParticipant, onMakeCaptain } =
    useTournamentDetail(tournamentId);

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>読み込み中...</div>
      </div>
    );
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  if (!tournament)
    return <div className={styles.notFoundContainer}>トーナメントが見つかりません</div>;

  // ParticipantList用に型変換（weapon/xpはダミー値）
  const participantsForList = participants.map((p) => ({
    ...p,
    weapon: '未設定', // ダミー
    xp: 0, // ダミー
  }));

  return (
    <main className={`${styles.variables} ${styles.main}`}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>{tournament.name} の詳細</h1>
        <Link href="/" className={styles.backLink}>
          ← 一覧へ戻る
        </Link>
      </div>

      <div className={styles.createdAt}>📅 作成日: {tournament.createdAt}</div>

      {/* 参加者一覧をParticipantListで表示 */}
      <TournamentParticipantList
        tournamentId={tournament.id}
        participants={participantsForList}
        onCaptainToggle={onMakeCaptain}
        onAddParticipant={() => {}}
        processingCaptainId={null}
      />

      <form onSubmit={onAddParticipant} className={styles.form}>
        <input
          name="participantName"
          type="text"
          placeholder="参加者名"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          ➕ 参加者追加
        </button>
      </form>
    </main>
  );
}
