'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';


// フックのインポート

// コンポーネントのインポート
import { AddParticipantModal } from '../../components/tournaments/AddParticipantModal';
import { ConfirmDialog } from '../../components/tournaments/ConfirmDialog';
import { ParticipantList } from '../../components/tournaments/ParticipantList';
import { TeamList } from '../../components/tournaments/TeamList';
import { TournamentInfo } from '../../components/tournaments/TournamentInfo';
import { formatDate } from '../../utils/formatDate';

import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { useTournamentDetails } from './hooks/useTournamentDetails';

export default function TournamentDetails() {
  const params = useParams();
  const id = params.id as string;

  // カスタムフックから状態と関数を取得
  const {
    tournament,
    loading,
    error,
    showModal,
    setShowModal,
    participantForm,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCaptainToggle,
    isProcessingCaptain,
    // ドラフトリセット関連
    isResetting,
    showConfirmDialog,
    resetError,
    handleResetClick,
    handleConfirmReset,
    handleCancelReset,
  } = useTournamentDetails(id);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!tournament) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            作成日: {formatDate(tournament.createdAt)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          {/* ドラフトリセットボタン */}
          <button
            onClick={handleResetClick}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition"
          >
            ドラフトをリセット
          </button>

          <Link
            href="/"
            className="inline-block px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition text-center"
          >
            ← トップページへ戻る
          </Link>
        </div>
      </div>

      {/* 大会情報 */}
      <TournamentInfo tournament={tournament} />

      {/* チーム一覧セクション */}
      <TeamList teams={tournament.teams} />

      {/* 参加者一覧セクション */}
      <ParticipantList
        tournamentId={tournament.id}
        tournamentParticipants={tournament.tournamentParticipants}
        onCaptainToggle={handleCaptainToggle}
        onAddParticipant={() => setShowModal(true)}
        processingCaptainId={isProcessingCaptain}
      />

      {/* 参加者追加モーダル */}
      <AddParticipantModal
        isOpen={showModal}
        isSubmitting={isSubmitting}
        error={submitError}
        formData={participantForm}
        onClose={() => setShowModal(false)}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {/* ドラフトリセット確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="ドラフトリセットの確認"
        message="ドラフトをリセットすると、チームデータと指名情報がすべて削除され、元に戻すことはできません。本当にリセットしますか？"
        confirmText="リセットする"
        cancelText="キャンセル"
        isProcessing={isResetting}
        error={resetError}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </div>
  );
}
