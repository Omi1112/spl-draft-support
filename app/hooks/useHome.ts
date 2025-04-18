import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ページ遷移用

import { createTournament } from '@/app/client/tournament/createTournament';
import { fetchTournaments } from '@/app/client/tournament/fetchTournaments';

export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
}

export function useHome() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter(); // ルーターインスタンス取得

  const openCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

  // APIクライアントでトーナメント一覧を取得
  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTournaments();
      setTournaments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'トーナメント一覧取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回マウント時に一覧取得
  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleCreateTournament = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get('tournamentName') ?? '').trim();
      if (!name) return;
      setLoading(true);
      setError('');
      try {
        // createTournamentの戻り値から大会IDを取得し、詳細ページへ遷移
        const created = await createTournament({ name });
        // created.idが存在する場合のみ遷移
        if (created && typeof created.id === 'string' && created.id) {
          router.push(`/tournaments/${created.id}`);
        }
        await loadTournaments(); // 作成後に再取得
        setIsCreateModalOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'トーナメント作成に失敗しました');
      } finally {
        setLoading(false);
      }
    },
    [loadTournaments, router]
  );

  return {
    tournaments,
    loading,
    error,
    openCreateModal,
    isCreateModalOpen,
    closeCreateModal,
    handleCreateTournament,
  };
}
