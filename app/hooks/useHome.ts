'use client';

import { useState, useEffect } from 'react';
import { fetchTournaments } from '../client/tournamentClient';

// 大会データの型定義
export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
}

/**
 * ホームページで使用するカスタムフック
 * トーナメントデータの取得と状態管理を行う
 */
export function useHome() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTournaments() {
      try {
        setLoading(true);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (err) {
        console.error('大会一覧の取得エラー:', err);
        setError('大会一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadTournaments();
  }, []);

  return {
    tournaments,
    loading,
    error,
  };
}
