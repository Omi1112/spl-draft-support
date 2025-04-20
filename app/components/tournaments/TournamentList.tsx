'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { fetchTournaments } from '../../client/tournament/fetchTournaments'; // 相対パスに修正

// 大会データの型定義 (fetchTournaments.ts と共通化も検討)
interface Tournament {
  id: string;
  name: string;
  createdAt: string;
}

// Props を削除
// interface TournamentListProps {
//   tournaments: Tournament[];
//   onCreateTournament: () => void;
// }

// Props を削除
// const TournamentList: React.FC<TournamentListProps> = ({ tournaments, onCreateTournament }) => {
const TournamentList: React.FC = () => {
  // 状態変数を追加
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得処理
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        const data = await fetchTournaments();
        setTournaments(data);
        setError(null); // 成功したらエラーをクリア
      } catch (err) {
        console.error('Failed to load tournaments:', err);
        setError('大会データの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, []); // マウント時に一度だけ実行

  // ローディング表示
  if (loading) {
    return <div data-testid="loading-indicator">読み込み中...</div>;
  }

  // エラー表示
  if (error) {
    return (
      <div data-testid="error-message" className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* 「大会を作成する」ボタンを削除 */}
      {/* <div className="flex justify-end mb-4">
        <button
          onClick={onCreateTournament}
          data-testid="create-tournament-button"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          大会を作成する
        </button>
      </div> */}

      {/* 標準のtableタグを使用 */}
      <table className="min-w-full divide-y divide-gray-200" data-testid="tournament-table">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              data-testid="tournament-list-header-name"
            >
              大会名
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              data-testid="tournament-list-header-createdat"
            >
              作成日
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tournaments.length === 0 ? (
            <tr data-testid="no-tournaments-row">
              <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                大会がありません。
              </td>
            </tr>
          ) : (
            tournaments.map((tournament) => (
              <tr key={tournament.id} data-testid={`tournament-row-${tournament.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    data-testid={`tournament-link-${tournament.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {tournament.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tournament.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentList;
