'use client';

import { useCaptainManagement } from './useCaptainManagement';
import { useDraftReset } from './useDraftReset';
import { useParticipantForm } from './useParticipantForm';
import { useTournamentData } from './useTournamentData';

/**
 * トーナメント詳細画面で必要な機能をまとめた統合カスタムフック
 */
export function useTournamentDetails(tournamentId: string) {
  // トーナメントデータの取得・管理
  const { tournament, loading, error, refreshTournament } = useTournamentData(tournamentId);

  // 参加者フォームの処理
  const {
    showModal,
    setShowModal,
    participantForm,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
  } = useParticipantForm(tournament, refreshTournament);

  // キャプテン管理の処理
  const { handleCaptainToggle, isProcessing } = useCaptainManagement(tournament, refreshTournament);

  // ドラフトリセット機能
  const {
    isResetting,
    showConfirmDialog,
    resetError,
    handleResetClick,
    handleConfirmReset,
    handleCancelReset,
  } = useDraftReset(tournament, refreshTournament);

  return {
    // トーナメントデータ
    tournament,
    loading,
    error,

    // 参加者フォーム関連
    showModal,
    setShowModal,
    participantForm,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,

    // キャプテン管理関連
    handleCaptainToggle,
    isProcessingCaptain: isProcessing,

    // ドラフトリセット関連
    isResetting,
    showConfirmDialog,
    resetError,
    handleResetClick,
    handleConfirmReset,
    handleCancelReset,
  };
}
