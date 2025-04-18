'use client';
// 大会一覧を表示するコンポーネント
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { fetchTournaments, Tournament } from '@/app/client/tournament/fetchTournaments';

/**
 * 大会一覧表示コンポーネント
 */
const TournamentList: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 大会一覧を取得する関数
  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '大会一覧の取得中にエラーが発生しました');
      console.error('大会一覧の取得中にエラーが発生しました:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // コンポーネントのマウント時に大会一覧を取得
  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          role="status"
        >
          <span className="sr-only">読み込み中...</span>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
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
            <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => loadTournaments()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 大会が0件の場合の表示
  if (tournaments.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">大会が登録されていません</p>
      </div>
    );
  }

  // 大会一覧の表示
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* デスクトップとタブレット用のテーブル表示 */}
      <div className="hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                大会名
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                作成日
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tournaments.map((tournament) => (
              <TournamentRow key={tournament.id} tournament={tournament} />
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル用のカード表示 */}
      <div className="sm:hidden">
        <ul className="divide-y divide-gray-200">
          {tournaments.map((tournament) => {
            const navigateToDetail = () => {
              window.location.href = `/tournaments/${tournament.id}`;
            };

            return (
              <li
                key={tournament.id}
                className="px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={navigateToDetail}
                role="link"
                aria-label={`${tournament.name}の詳細を表示`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigateToDetail();
                  }
                }}
              >
                <div className="flex flex-col space-y-2">
                  <div className="font-medium text-gray-900">{tournament.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Intl.DateTimeFormat('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(tournament.createdAt))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

/**
 * 大会一覧の各行を表示するコンポーネント
 */
interface TournamentRowProps {
  tournament: Tournament;
}

const TournamentRow: React.FC<TournamentRowProps> = ({ tournament }) => {
  // 日付のフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 詳細ページへ遷移する関数
  const navigateToDetail = () => {
    window.location.href = `/tournaments/${tournament.id}`;
  };

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
      onClick={navigateToDetail}
      role="link"
      aria-label={`${tournament.name}の詳細を表示`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToDetail();
        }
      }}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {tournament.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(tournament.createdAt)}
      </td>
    </tr>
  );
};

export default TournamentList;
