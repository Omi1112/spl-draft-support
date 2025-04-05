"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "../../utils/formatDate";

// 大会データの型定義
interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  participants: Participant[];
}

// 参加者データの型定義
interface Participant {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: string;
}

// 参加登録データの型定義
interface TournamentParticipant {
  id: string;
  tournamentId: string;
  participantId: string;
  createdAt: string;
}

// GraphQLクエリを実行する関数
async function fetchTournament(id: string) {
  const query = `
    query GetTournament($id: ID!) {
      tournament(id: $id) {
        id
        name
        createdAt
        participants {
          id
          name
          weapon
          xp
          createdAt
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
      variables: { id },
    }),
  });

  const result = await response.json();
  return result.data.tournament;
}

// 参加者を大会に追加するGraphQLミューテーション
async function addParticipantToTournament(
  tournamentId: string,
  participantData: { name: string; weapon: string; xp: number }
) {
  const mutation = `
    mutation AddParticipantToTournament($input: AddParticipantToTournamentInput!) {
      addParticipantToTournament(input: $input) {
        id
        tournamentId
        participantId
        createdAt
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
        input: {
          tournamentId,
          participant: participantData,
        },
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message || "GraphQL error occurred");
  }
  return result.data.addParticipantToTournament;
}

export default function TournamentDetails() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル表示状態
  const [showModal, setShowModal] = useState(false);

  // 参加者フォームの状態
  const [participantForm, setParticipantForm] = useState({
    name: "",
    weapon: "",
    xp: "",
  });

  // 参加者追加の状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    async function loadTournament() {
      try {
        setLoading(true);
        const data = await fetchTournament(id);
        if (data) {
          setTournament(data);
        } else {
          setError("大会が見つかりませんでした。");
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } catch (err) {
        console.error("Error fetching tournament:", err);
        setError("データの取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    loadTournament();
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParticipantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournament) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 参加者を作成して大会に追加
      await addParticipantToTournament(tournament.id, {
        name: participantForm.name,
        weapon: participantForm.weapon,
        xp: parseInt(participantForm.xp, 10),
      });

      // 更新されたデータを取得
      const updatedTournament = await fetchTournament(tournament.id);
      setTournament(updatedTournament);

      // フォームをリセット
      setParticipantForm({
        name: "",
        weapon: "",
        xp: "",
      });

      // モーダルを閉じる
      setShowModal(false);
    } catch (err) {
      console.error("参加者追加エラー:", err);
      setSubmitError("参加者の追加に失敗しました。");
    } finally {
      setIsSubmitting(false);
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
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            トップページに戻る
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {tournament.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            作成日: {formatDate(tournament.createdAt)}
          </p>
        </div>
        <Link
          href="/"
          className="mt-4 sm:mt-0 inline-block px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition"
        >
          ← トップページへ戻る
        </Link>
      </div>

      {/* 大会情報 */}
      <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          大会情報
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          大会ID: {tournament.id}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          参加者数: {tournament.participants.length}人
        </p>
      </div>

      {/* 参加者一覧セクション */}
      <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">参加者一覧</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            参加者を追加
          </button>
        </div>

        {tournament.participants.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md text-center">
            <p className="text-gray-600 dark:text-gray-400">
              参加者はまだいません
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
                </tr>
              </thead>
              <tbody>
                {tournament.participants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-3">{participant.name}</td>
                    <td className="px-4 py-3">{participant.weapon}</td>
                    <td className="px-4 py-3">
                      {participant.xp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 参加者追加モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-850 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">参加者を追加</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              {submitError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 rounded-md mb-4 text-red-700 dark:text-red-400">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
                  >
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={participantForm.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="参加者の名前"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="weapon"
                    className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
                  >
                    使用武器 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="weapon"
                    name="weapon"
                    value={participantForm.weapon}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="使用する武器"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="xp"
                    className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
                  >
                    XP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="xp"
                    name="xp"
                    value={participantForm.xp}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    placeholder="経験値ポイント"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "送信中..." : "追加する"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
