"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "../../utils/formatDate";

// 大会データの型定義
interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  participants: Participant[];
  captain?: Participant;
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
}

// チームデータの型定義
interface Team {
  id: string;
  name: string;
  captainId: string;
  captain: Participant;
  members: Participant[];
  createdAt: string;
}

// 参加登録データの型定義
interface TournamentParticipant {
  id: string;
  tournamentId: string;
  participantId: string;
  createdAt: string;
  isCaptain: boolean;
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
        captains {
          id
          name
          weapon
          xp
        }
        teams {
          id
          name
          captainId
          captain {
            id
            name
            weapon
            xp
          }
          members {
            id
            name
            weapon
            xp
          }
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

  // エラーチェックを追加
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(result.errors[0]?.message || "GraphQL error occurred");
  }

  // データの存在を確認
  if (!result.data || !result.data.tournament) {
    console.error("Unexpected response structure:", result);
    throw new Error("大会データが見つかりませんでした");
  }

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

// 主将を設定するGraphQLミューテーション
async function setCaptain(tournamentId: string, participantId: string) {
  const mutation = `
    mutation SetCaptain($input: SetCaptainInput!) {
      setCaptain(input: $input) {
        id
        tournamentId
        participantId
        isCaptain
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
          participantId,
        },
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message || "GraphQL error occurred");
  }
  return result.data.setCaptain;
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
          // キャプテン情報をもとに参加者データに isCaptain フラグを追加
          const captainIds = data.captains.map(
            (captain: Participant) => captain.id
          );
          const participantsWithCaptainFlag = data.participants.map((p) => ({
            ...p,
            isCaptain: captainIds.includes(p.id),
          }));

          setTournament({
            ...data,
            participants: participantsWithCaptainFlag,
          });
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

  const handleCaptainToggle = async (participantId: string) => {
    if (!tournament) return;

    try {
      await setCaptain(tournament.id, participantId);

      // 更新されたデータを取得
      const updatedTournament = await fetchTournament(tournament.id);

      // キャプテン情報をもとに参加者データに isCaptain フラグを追加
      if (updatedTournament) {
        const captainIds = updatedTournament.captains.map(
          (captain: Participant) => captain.id
        );
        const participantsWithCaptainFlag = updatedTournament.participants.map(
          (p: Participant) => ({
            ...p,
            isCaptain: captainIds.includes(p.id),
          })
        );

        setTournament({
          ...updatedTournament,
          participants: participantsWithCaptainFlag,
        });
      }
    } catch (err) {
      console.error("主将設定エラー:", err);
      // エラー処理
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

      {/* チーム一覧セクション */}
      <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          チーム一覧
        </h2>

        {!tournament.teams || tournament.teams.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md text-center">
            <p className="text-gray-600 dark:text-gray-400">
              チームはまだ作成されていません
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              キャプテンページからドラフトを開始してチームを作成できます
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournament.teams.map((team) => (
              <div
                key={team.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{team.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      作成日: {formatDate(team.createdAt)}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md">
                    {team.members.length}人
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      主将:
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {team.captain.name}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    メンバー:
                  </h4>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {team.captainId === member.id && (
                            <span className="text-xs px-1 py-0.5 bg-red-500 text-white rounded">
                              主将
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-2">{member.weapon}</span>
                          <span>{member.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <>
            <div className="overflow-x-auto mb-4">
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
                      主将
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tournament.participants.map((participant) => {
                    const isCaptain = participant.isCaptain || false;

                    return (
                      <React.Fragment key={participant.id}>
                        <tr
                          className={`border-t border-gray-200 dark:border-gray-700 ${
                            isCaptain ? "bg-red-50 dark:bg-red-900/10" : ""
                          }`}
                        >
                          <td className="px-4 py-3">{participant.name}</td>
                          <td className="px-4 py-3">{participant.weapon}</td>
                          <td className="px-4 py-3">
                            {participant.xp.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                handleCaptainToggle(participant.id)
                              }
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                isCaptain
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {isCaptain ? "主将" : "主"}
                            </button>
                          </td>
                        </tr>
                        {/* キャプテンの場合、そのレコードの直下にキャプテンページへのリンクを表示 */}
                        {isCaptain && (
                          <tr className="bg-red-50/50 dark:bg-red-900/5">
                            <td colSpan={4} className="px-4 py-2">
                              <Link
                                href={`/tournaments/${tournament.id}/captain/${participant.id}`}
                                className="text-sm inline-flex items-center text-red-600 hover:text-red-700 gap-1"
                              >
                                <span>
                                  {participant.name}のキャプテンページを表示
                                </span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </Link>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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
