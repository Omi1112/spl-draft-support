"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "../../../../utils/formatDate";

// 大会データの型定義
interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  teams?: Team[];
}

// 参加者データの型定義
interface Participant {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: string;
  isCaptain?: boolean;
  team?: Team;
}

// チームデータの型定義
interface Team {
  id: string;
  name: string;
  captainId: string;
  members?: Participant[];
}

// GraphQLクエリを実行する関数
async function fetchTournamentData(tournamentId: string, captainId: string) {
  const query = `
    query GetTournamentData($tournamentId: ID!) {
      tournament(id: $tournamentId) {
        id
        name
        createdAt
        teams {
          id
          name
          captainId
        }
      }
      participants(tournamentId: $tournamentId) {
        id
        name
        weapon
        xp
        createdAt
        isCaptain
        team {
          id
          name
        }
      }
    }
  `;

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { tournamentId },
    }),
  });

  const result = await response.json();

  // エラーチェックを追加
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(result.errors[0]?.message || "GraphQL error occurred");
  }

  // データの存在を確認
  if (!result.data || !result.data.tournament || !result.data.participants) {
    console.error("Unexpected response structure:", result);
    throw new Error("大会またはキャプテンのデータが見つかりませんでした");
  }

  // キャプテンIDに一致する参加者を検索
  const captain = result.data.participants.find(
    (p: Participant) => p.id === captainId
  );

  if (!captain) {
    throw new Error("指定されたキャプテンが見つかりませんでした");
  }

  // チームに所属していない参加者だけをフィルタリング
  const unassignedParticipants = result.data.participants.filter(
    (p: Participant) => !p.team
  );

  return {
    tournament: result.data.tournament,
    captain,
    participants: unassignedParticipants,
  };
}

// ドラフトを開始する関数
async function startDraft(tournamentId: string) {
  const mutation = `
    mutation StartDraft($input: StartDraftInput!) {
      startDraft(input: $input) {
        id
        name
        captainId
      }
    }
  `;

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: { tournamentId },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(
      result.errors[0]?.message || "ドラフト開始中にエラーが発生しました"
    );
  }

  return result.data.startDraft;
}

// ドラフトをリセットする関数
async function resetDraft(tournamentId: string) {
  const mutation = `
    mutation ResetDraft($input: ResetDraftInput!) {
      resetDraft(input: $input)
    }
  `;

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: { tournamentId },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(
      result.errors[0]?.message || "ドラフトリセット中にエラーが発生しました"
    );
  }

  return result.data.resetDraft;
}

export default function CaptainPersonalPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [captain, setCaptain] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isStartLoading, setIsStartLoading] = useState(false);
  const [hasTeams, setHasTeams] = useState(false);

  useEffect(() => {
    const tournamentId = params.id as string;
    const captainId = params.captainId as string;

    if (!tournamentId || !captainId) return;

    async function loadTournamentData() {
      try {
        setLoading(true);
        const data = await fetchTournamentData(tournamentId, captainId);
        if (data) {
          setTournament(data.tournament);
          setCaptain(data.captain);
          setParticipants(data.participants);
          setHasTeams(
            data.tournament.teams && data.tournament.teams.length > 0
          );
        } else {
          setError("データが見つかりませんでした。");
          setTimeout(() => {
            router.push(`/tournaments/${tournamentId}`);
          }, 3000);
        }
      } catch (err) {
        console.error("Error fetching tournament data:", err);
        setError("データの取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    loadTournamentData();
  }, [params.id, params.captainId, router]);

  // ドラフト開始のハンドラー
  const handleStartDraft = async () => {
    if (!tournament) return;

    try {
      setIsStartLoading(true);
      await startDraft(tournament.id);

      // ドラフト開始後にデータを再取得
      const tournamentId = params.id as string;
      const captainId = params.captainId as string;
      const data = await fetchTournamentData(tournamentId, captainId);
      setTournament(data.tournament);
      setHasTeams(true);

      // 成功メッセージ
      alert("ドラフトが開始されました。");
    } catch (err) {
      console.error("Error starting draft:", err);
      setError(
        err instanceof Error ? err.message : "ドラフトの開始に失敗しました。"
      );
    } finally {
      setIsStartLoading(false);
    }
  };

  // ドラフトリセットのハンドラー
  const handleResetDraft = async () => {
    if (!tournament) return;

    if (
      !window.confirm(
        "本当にドラフトをリセットしますか？全てのチームが削除されます。"
      )
    ) {
      return;
    }

    try {
      setIsResetLoading(true);
      await resetDraft(tournament.id);
      setHasTeams(false);

      // リセット後にデータを再取得
      const tournamentId = params.id as string;
      const captainId = params.captainId as string;
      const data = await fetchTournamentData(tournamentId, captainId);
      setTournament(data.tournament);

      // 成功メッセージ
      alert("ドラフトがリセットされました。");

      // キャプテンページに移動
      router.push(`/tournaments/${tournament.id}`);
    } catch (err) {
      console.error("Error resetting draft:", err);
      setError(
        err instanceof Error
          ? err.message
          : "ドラフトのリセットに失敗しました。"
      );
    } finally {
      setIsResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
            role="status"
          ></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">ロード中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            エラー
          </h2>
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {tournament.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            キャプテンページ: {captain.name}
          </p>
        </div>
        <Link
          href={`/tournaments/${params.id}`}
          className="mt-4 sm:mt-0 inline-block px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition"
        >
          ← 大会ページへ戻る
        </Link>
      </div>

      {/* ドラフト管理セクション */}
      <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          ドラフト管理
        </h2>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {hasTeams
              ? "この大会のドラフトはすでに開始されています。必要に応じてドラフトをリセットできます。"
              : "キャプテンページからドラフトを開始してチームを作成できます。ドラフトを開始すると、各キャプテンのチームが作成されます。"}
          </p>

          <div className="flex flex-wrap gap-3">
            {!hasTeams ? (
              <button
                onClick={handleStartDraft}
                disabled={isStartLoading}
                className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition ${
                  isStartLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isStartLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    処理中...
                  </span>
                ) : (
                  "ドラフト開始"
                )}
              </button>
            ) : (
              <button
                onClick={handleResetDraft}
                disabled={isResetLoading}
                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition ${
                  isResetLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isResetLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    処理中...
                  </span>
                ) : (
                  "ドラフトをリセット"
                )}
              </button>
            )}

            <Link
              href={`/tournaments/${params.id}/teams`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
            >
              チーム一覧を見る
            </Link>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                注意
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {!hasTeams
                  ? "ドラフトを開始すると、各キャプテンにチームが割り当てられます。この操作は後で取り消すことができます。"
                  : "ドラフトをリセットすると、すべてのチーム情報が削除され、再度ドラフトを行う必要があります。この操作は取り消せません。"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* キャプテン情報 */}
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
          </div>
        </div>
      </div>

      {/* 参加者一覧セクション */}
      <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
          未所属の参加者一覧
        </h2>

        {participants.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md text-center">
            <p className="text-gray-600 dark:text-gray-400">
              チームに所属していない参加者はいません！
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                    名前
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                    使用武器
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                    XP
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-gray-600 dark:text-gray-300">
                    役割
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr
                    key={participant.id}
                    className={`border-t border-gray-200 dark:border-gray-700 ${
                      participant.isCaptain
                        ? "bg-red-50 dark:bg-red-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">{participant.name}</td>
                    <td className="px-4 py-3">{participant.weapon}</td>
                    <td className="px-4 py-3">
                      {participant.xp.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {participant.isCaptain ? (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-md">
                          キャプテン
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                          メンバー
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
