'use client';

import { useState } from 'react';
import { resetDraft } from '../../../client/tournamentClient';
import { Tournament } from '../../../components/tournaments/types';

/**
 * ドラフトリセット機能を提供するカスタムフック
 *
 * @param tournament トーナメントデータ
 * @param onResetSuccess リセット成功時のコールバック関数
 * @returns ドラフトリセット関連の状態と関数
 */
export function useDraftReset(tournament: Tournament | null, onResetSuccess: () => void) {
  // リセット処理中かどうかのフラグ
  const [isResetting, setIsResetting] = useState(false);
  // 確認ダイアログの表示状態
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // エラーメッセージ
  const [resetError, setResetError] = useState<string | null>(null);

  /**
   * リセットボタンクリック時のハンドラー - 確認ダイアログを表示
   */
  const handleResetClick = () => {
    setShowConfirmDialog(true);
    setResetError(null);
  };

  /**
   * リセット確認時のハンドラー - 実際のリセット処理を実行
   */
  const handleConfirmReset = async () => {
    if (!tournament) return;

    setIsResetting(true);
    setResetError(null);

    try {
      // ドラフトリセットAPIを呼び出す
      await resetDraft(tournament.id);

      // 成功時の処理
      setShowConfirmDialog(false);
      onResetSuccess();
    } catch (error) {
      // エラー処理
      console.error('ドラフトリセットエラー:', error);
      setResetError(
        error instanceof Error ? error.message : 'リセット処理中にエラーが発生しました'
      );
    } finally {
      setIsResetting(false);
    }
  };

  /**
   * リセット確認ダイアログをキャンセル
   */
  const handleCancelReset = () => {
    setShowConfirmDialog(false);
    setResetError(null);
  };

  return {
    isResetting,
    showConfirmDialog,
    resetError,
    handleResetClick,
    handleConfirmReset,
    handleCancelReset,
  };
}
