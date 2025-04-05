'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '../../../utils/formatDate';

// 大会データの型定義
interface Tournament {
  id: string;
  name: string;
  createdAt: string;
}

// キャプテン（参加者）データの型定義
interface Captain {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: string;
}

// GraphQLクエリを実行する関数
async function fetchTournamentCaptains(tournamentId: string) {
  const query = `
    query GetTournamentCaptains($id: ID!) {
      tournament(id: $id) {
        id
        name
        createdAt
        participants(isCaptain: true) {
          id
          name
          weapon
          xp
          createdAt
        }
      }
    }
  `;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { id: tournamentId },
    }),
  });

  const result = await response.json();
  
  // エラーチェック
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
  }
  
  return result.data.tournament;
}

export default function TournamentCaptainsPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament & { participants: Captain[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tournamentId = params.id as string;
    
    async function loadTournamentCaptains() {
      try {
        setLoading(true);
        const tournamentData = await fetchTournamentCaptains(tournamentId);
        setTournament(tournamentData);
      } catch (err) {
        console.error('Error fetching tournament captains:', err);
        setError('キャプテンデータの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    if (tournamentId) {
      loadTournamentCaptains();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">ロード中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">エラー</h2>
          <p className="mb-4">{error}</p>
          <Link 
            href={`/tournaments/${params.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            大会詳細に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            キャプテン一覧
          </p>
        </div>
        <Link 
          href={`/tournaments/${params.id}`}
          className="mt-4 sm:mt-0 inline-block px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition"
        >
          ← 大会詳細に戻る
        </Link>
      </div>

      {tournament.participants && tournament.participants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournament.participants.map(captain => (
            <Link 
              href={`/tournaments/${tournament.id}/captain/${captain.id}`} 
              key={captain.id}
              className="block bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 transition hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
            >
              <div className="flex items-center gap-4">
                {/* キャプテンのアバター（仮想的な要素） */}
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {captain.name.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-lg font-medium mb-1">{captain.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    武器: {captain.weapon}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">XP: {captain.xp.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      参加日: {formatDate(captain.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">この大会にはキャプテンが登録されていません。</p>
        </div>
      )}
    </div>
  );
}