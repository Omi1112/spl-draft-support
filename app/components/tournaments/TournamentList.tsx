'use client';
// app/components/tournaments/TournamentList.tsx
// トーナメント一覧を表示するコンポーネント

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTournaments, Tournament } from '../../client/tournament/fetchTournaments';

/**
 * トーナメント一覧を表示するコンポーネント
 */
export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        const data = await fetchTournaments();
        setTournaments(data);
        setError(null);
      } catch (err) {
        console.error('トーナメント一覧の取得に失敗しました:', err);
        setError('トーナメント一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, []);

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
          <p className="text-gray-500">
            大会が登録されていません。「大会作成」ボタンから新しい大会を作成してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{tournament.name}</h3>
              <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4">
                <p>作成日: {formatDate(tournament.createdAt)}</p>
                <p>
                  参加者: {tournament.participants?.length}人 | チーム:{' '}
                  {tournament.teams?.length > 0 ? `${tournament.teams?.length}チーム` : 'なし'}
                </p>
                <p>
                  状態:{' '}
                  {tournament.draftStatus
                    ? `ドラフト進行中 (ラウンド${tournament.draftStatus.round} ターン${tournament.draftStatus.turn})`
                    : 'ドラフト未開始'}
                </p>
              </div>
              <Link
                href={`/tournaments/${tournament.id}`}
                className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                詳細を見る
              </Link>
              <p className="text-sm text-gray-500 mt-2">
                参加者: {tournament.participants?.length}人 | チーム:{' '}
                {tournament.teams?.length > 0 ? `${tournament.teams?.length}チーム` : 'なし'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
