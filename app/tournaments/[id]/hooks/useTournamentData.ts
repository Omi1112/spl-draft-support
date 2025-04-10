'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tournament } from '../../../components/tournaments/types';
import { fetchTournament } from '../../../client/tournamentClient';
import { addCaptainFlagsToParticipants } from './tournamentUtils';

/**
 * トーナメント詳細データを取得・管理するためのカスタムフック
 */
export function useTournamentData(tournamentId: string) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 大会データの読み込み
  useEffect(() => {
    if (!tournamentId) {
      setError('大会が見つかりませんでした。');
      setLoading(false);
      return;
    }

    async function loadTournament() {
      try {
        setLoading(true);
        const data = await fetchTournament(tournamentId);

        if (data) {
          // キャプテン情報をもとに参加者データに isCaptain フラグを追加
          const tournamentWithCaptainFlags = addCaptainFlagsToParticipants(data);
          setTournament(tournamentWithCaptainFlags);
        } else {
          setError('大会が見つかりませんでした。');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (err) {
        console.error('Error fetching tournament:', err);
        setError('データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }

    loadTournament();
  }, [tournamentId, router]);

  // トーナメントデータを最新化する関数
  const refreshTournament = async (skipLoading = false) => {
    if (!tournamentId) return;

    try {
      // skipLoadingがtrueの場合はローディング状態を変更しない
      if (!skipLoading) {
        setLoading(true);
      }

      const data = await fetchTournament(tournamentId);

      if (data) {
        const tournamentWithCaptainFlags = addCaptainFlagsToParticipants(data);
        setTournament(tournamentWithCaptainFlags);
      }
    } catch (err) {
      console.error('Error refreshing tournament:', err);
    } finally {
      // skipLoadingがtrueの場合のみローディング状態を元に戻す
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  return {
    tournament,
    setTournament,
    loading,
    error,
    refreshTournament,
  };
}
