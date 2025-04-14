'use client';

import { useState } from 'react';

import { toggleCaptain } from '../../../client/tournamentClient';
import { Tournament } from '../../../components/tournaments/types';

/**
 * キャプテン管理のための処理を行うカスタムフック
 */
export function useCaptainManagement(
  tournament: Tournament | null,
  onCaptainUpdated: (skipLoading?: boolean) => Promise<void>
) {
  // 処理中状態の管理
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // キャプテン設定のトグルハンドラー
  const handleCaptainToggle = async (participantId: string) => {
    if (!tournament) return;

    // 同じ参加者に対する連続クリックを防止
    if (isProcessing === participantId) return;

    setIsProcessing(participantId);

    try {
      // キャプテン設定を変更
      await toggleCaptain(tournament.id, participantId);

      // データを最新化（ローディングをスキップ）
      await onCaptainUpdated(true);

      console.log(`キャプテン設定を更新しました: 参加者ID=${participantId}`);
    } catch (err) {
      console.error('主将設定エラー:', err);
      // エラー処理
    } finally {
      // 処理完了状態をリセット
      setIsProcessing(null);
    }
  };

  return {
    handleCaptainToggle,
    isProcessing,
  };
}
