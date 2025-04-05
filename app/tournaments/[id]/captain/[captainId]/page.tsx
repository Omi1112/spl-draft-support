'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '../../../../utils/formatDate';

// 大会データの型定義
interface Tournament {
  id: string;
  name: string;
  createdAt: string;
}

// 参加者データの型定義
interface Participant {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: string;
}

// GraphQLクエリを実行する関数
async function fetchTournamentCaptain(tournamentId: string, captainId: string) {
  const query = `
    query GetTournamentCaptain($tournamentId: ID!) {
      tournament(id: $tournamentId) {
        id
        name
        createdAt
      }
      participants(tournamentId: $tournamentId) {
        id
        name
        weapon
        xp
        createdAt
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
      variables: { tournamentId },
    }),
  });

  const result = await response.json();
  
  // エラーチェックを追加
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
  }
  
  // データの存在を確認
  if (!result.data || !result.data.tournament || !result.data.participants) {
    console.error('Unexpected response structure:', result);
    throw new Error('大会またはキャプテンのデータが見つかりませんでした');
  }
  
  // キャプテンIDに一致する参加者を検索
  const captain = result.data.participants.find((p: Participant) => p.id === captainId);
  
  if (!captain) {
    throw new Error('指定されたキャプテンが見つかりませんでした');
  }
  
  return {
    tournament: result.data.tournament,
    captain
  };
}

export default function CaptainPersonalPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [captain, setCaptain] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tournamentId = params.id as string;
    const captainId = params.captainId as string;
    
    if (!tournamentId || !captainId) return;

    async function loadTournamentCaptain() {
      try {
        setLoading(true);
        const data = await fetchTournamentCaptain(tournamentId, captainId);
        if (data) {
          setTournament(data.tournament);
          setCaptain(data.captain);
        } else {
          setError('データが見つかりませんでした。');
          setTimeout(() => {
            router.push(`/tournaments/${tournamentId}`);
          }, 3000);
        }
      } catch (err) {
        console.error('Error fetching tournament captain:', err);
        setError('データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }

    loadTournamentCaptain();
  }, [params.id, params.captainId, router]);

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

  if (!tournament || !captain) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            キャプテンページ: {captain.name}
          </p>
        </div>
        <Link 
          href={`/tournaments/${params.id}`}
          className="mt-4 sm:mt-0 inline-block px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition"
        >
          ← 大会詳細に戻る
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          キャプテン情報
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          {/* キャプテンのアバター（仮想的な要素） */}
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {captain.name.charAt(0)}
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{captain.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">キャプテン</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">使用武器</p>
                <p className="font-medium">{captain.weapon}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">XP</p>
                <p className="font-medium">{captain.xp.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">参加日</p>
                <p className="font-medium">{formatDate(captain.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">キャプテンの役割</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>チームの代表として大会運営と連絡を取る</li>
            <li>メンバーの指導と戦略の策定</li>
            <li>試合中の戦術的判断とチーム統率</li>
            <li>大会のルールやスケジュール管理</li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">キャプテンメッセージ</h3>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
            <p className="italic text-gray-700 dark:text-gray-300">
              「私はチームの皆と共に最高の結果を出すために全力を尽くします。一人一人の力を信じ、団結してこの大会に挑みましょう！」
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}