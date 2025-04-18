'use client';

import Link from 'next/link';
import React from 'react';
import { useTournamentDetail } from '../../hooks/useTournamentDetail';
import { TournamentParticipant } from '@/app/api/core/domain/entities/TournamentParticipant';
import TournamentParticipantList from './components/TournamentParticipantList';
import { AddParticipantModal } from './components/AddParticipantModal'; // default importからnamed importに変更
import AddParticipantForm, { AddParticipantFormValues } from './components/AddParticipantForm';
import styles from './page.module.css';

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = React.use(params);
  const {
    tournament,
    participants,
    loading,
    error,
    onAddParticipant,
    onAddParticipantFromModal,
    onMakeCaptain,
  } = useTournamentDetail(tournamentId);
  const [modalOpen, setModalOpen] = React.useState(false);

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

  // 参加者追加モーダルの送信処理
  const handleAddParticipantFromModal = (values: AddParticipantFormValues) => {
    onAddParticipantFromModal(values);
    setModalOpen(false);
  };

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
        onAddParticipant={() => setModalOpen(true)}
        processingCaptainId={null}
      />

      {/* 参加者追加モーダル */}
      <AddParticipantModal open={modalOpen} onClose={() => setModalOpen(false)}>
        <AddParticipantForm
          onSubmit={handleAddParticipantFromModal}
          onClose={() => setModalOpen(false)}
        />
      </AddParticipantModal>
    </main>
  );
}
