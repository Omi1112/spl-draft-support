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
  draftStatus?: {
    round: number;
    turn: number;
  };
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

// 指名データの型定義
interface Draft {
  id: string;
  tournamentId: string;
  captainId: string;
  participantId: string;
  status: string;
  createdAt: string;
  captain?: {
    id: string;
    name: string;
  };
  participant?: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
  };
}

// GraphQLクエリを実行する関数
async function fetchTournamentData(tournamentId: string, captainId: string) {
  const query = `
    query GetTournamentData($tournamentId: ID!, $captainId: ID!) {
      tournament(id: $tournamentId) {
        id
        name
        createdAt
        teams {
          id
          name
          captainId
        }
        draftStatus {
          round
          turn
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
      allDrafts: drafts(tournamentId: $tournamentId) {
        id
        tournamentId
        captainId
        participantId
        status
        createdAt
        captain {
          id
          name
        }
        participant {
          id
          name
          weapon
          xp
        }
      }
      captainDrafts: drafts(tournamentId: $tournamentId, captainId: $captainId) {
        id
        tournamentId
        captainId
        participantId
        status
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
      query,
      variables: { tournamentId, captainId },
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
    (p: Participant) => !p.team && !p.isCaptain
  );

  return {
    tournament: result.data.tournament,
    captain,
    participants: unassignedParticipants,
    drafts: result.data.captainDrafts || [], // このキャプテンの指名データ
    allDrafts: result.data.allDrafts || [], // 大会全体の指名データ
    draftStatus: result.data.tournament.draftStatus,
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

// 選手を指名する関数
async function nominateParticipant(
  tournamentId: string,
  captainId: string,
  participantId: string
) {
  const mutation = `
    mutation NominateParticipant($input: NominateParticipantInput!) {
      nominateParticipant(input: $input) {
        id
        status
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
        input: { tournamentId, captainId, participantId },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(
      result.errors[0]?.message || "選手指名中にエラーが発生しました"
    );
  }

  return result.data.nominateParticipant;
}

// 指名ステータス更新する関数
async function updateDraftStatus(draftId: string, status: string) {
  const mutation = `
    mutation UpdateDraftStatus($input: UpdateDraftStatusInput!) {
      updateDraftStatus(input: $input) {
        id
        status
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
        input: { draftId, status },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(
      result.errors[0]?.message || "指名ステータス更新中にエラーが発生しました"
    );
  }

  return result.data.updateDraftStatus;
}

export default function CaptainPersonalPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [captain, setCaptain] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [allDrafts, setAllDrafts] = useState<Draft[]>([]); // 全てのドラフト情報
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isStartLoading, setIsStartLoading] = useState(false);
  const [isNominateLoading, setIsNominateLoading] = useState(false);
  const [hasTeams, setHasTeams] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nominationSuccess, setNominationSuccess] = useState<string | null>(
    null
  );
  const [nominationError, setNominationError] = useState<string | null>(null);
  const [currentRoundDraftComplete, setCurrentRoundDraftComplete] =
    useState(false);
  const [draftStatus, setDraftStatus] =
    useState<Tournament["draftStatus"]>(null);

  // 現在のドラフトラウンドが完了しているか確認
  const checkIfCurrentRoundDraftComplete = (
    draftsArray: Draft[],
    captainId: string | null
  ) => {
    if (!captainId) return false;

    // 現在のキャプテンの指名のみをフィルタリング
    const captainDrafts = draftsArray.filter(
      (draft) => draft.captainId === captainId && draft.status === "pending"
    );

    // 現在のラウンドで既に選手を指名しているかどうか
    return captainDrafts.length > 0;
  };

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
          setDrafts(data.drafts);
          setAllDrafts(data.allDrafts || []); // 大会全体のドラフトデータをセット
          setDraftStatus(data.draftStatus);
          setHasTeams(
            data.tournament.teams && data.tournament.teams.length > 0
          );

          // ドラフト状況をチェック
          const isDraftComplete = checkIfCurrentRoundDraftComplete(
            data.drafts,
            captainId
          );
          setCurrentRoundDraftComplete(isDraftComplete);
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
        "本当にドラフトをリセットしますか？全てのチームと指名履歴が削除されます。"
      )
    ) {
      return;
    }

    try {
      setIsResetLoading(true);
      await resetDraft(tournament.id);
      setHasTeams(false);
      setDrafts([]); // 指名データをクリア

      // リセット後にデータを再取得
      const tournamentId = params.id as string;
      const captainId = params.captainId as string;
      const data = await fetchTournamentData(tournamentId, captainId);
      setTournament(data.tournament);
      setParticipants(data.participants);

      // 成功メッセージ
      alert("ドラフトと指名履歴がリセットされました。");

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

  // 参加者指名ボタンのハンドラー
  const handleNominateClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowConfirmModal(true);
  };

  // 指名確定のハンドラー
  const handleConfirmNomination = async () => {
    if (!tournament || !captain || !selectedParticipant) return;

    try {
      setIsNominateLoading(true);
      setNominationError(null);

      const result = await nominateParticipant(
        tournament.id,
        captain.id,
        selectedParticipant.id
      );

      // モーダルを閉じて成功メッセージを表示
      setShowConfirmModal(false);
      setNominationSuccess(`${selectedParticipant.name}を指名しました！`);

      // 5秒後に成功メッセージを削除
      setTimeout(() => {
        setNominationSuccess(null);
      }, 5000);

      // データを再取得して表示を更新
      const tournamentId = params.id as string;
      const captainId = params.captainId as string;
      const data = await fetchTournamentData(tournamentId, captainId);
      setDrafts(data.drafts);
      setAllDrafts(data.allDrafts || []); // 大会全体のドラフトデータを更新
      setParticipants(data.participants);

      // ドラフト状況を更新
      const isDraftComplete = checkIfCurrentRoundDraftComplete(
        data.drafts,
        captainId
      );
      setCurrentRoundDraftComplete(isDraftComplete);
    } catch (err) {
      console.error("Error nominating participant:", err);
      setNominationError(
        err instanceof Error
          ? err.message
          : "指名処理中にエラーが発生しました。"
      );
    } finally {
      setIsNominateLoading(false);
    }
  };

  // モーダルキャンセルのハンドラー
  const handleCancelNomination = () => {
    setShowConfirmModal(false);
    setSelectedParticipant(null);
    setNominationError(null);
  };

  // 参加者が既に指名されているかチェックする関数
  const isParticipantNominated = (participantId: string) => {
    return drafts.some(
      (draft) =>
        draft.participantId === participantId && draft.captainId === captain?.id
    );
  };

  // 指名した選手データを取得する関数
  const getNominatedParticipants = () => {
    // このキャプテンの指名データ
    const captainNominations = drafts.filter(
      (draft) => draft.captainId === captain?.id
    );

    if (captainNominations.length === 0) return [];

    // 指名データと対応する参加者情報を関連付ける
    return captainNominations
      .map((draft) => {
        // 対応する参加者を探す
        const nominatedParticipant = participants.find(
          (p) => p.id === draft.participantId
        );

        // もし見つからない場合は、全ての指名データの中から対応するparticipant情報を探す
        const draftWithParticipant = allDrafts.find(
          (d) => d.participantId === draft.participantId && d.participant
        );

        // 参加者情報をマージ
        return {
          draft,
          participant:
            nominatedParticipant ||
            (draftWithParticipant?.participant
              ? {
                  id: draftWithParticipant.participant.id,
                  name: draftWithParticipant.participant.name,
                  weapon: draftWithParticipant.participant.weapon,
                  xp: draftWithParticipant.participant.xp,
                  createdAt: "",
                }
              : null),
        };
      })
      .filter((item) => item.participant !== null);
  };

  const nominatedParticipants = getNominatedParticipants();

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

      {/* 指名成功メッセージ */}
      {nominationSuccess && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {nominationSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* 指名済み参加者セクション */}
      {nominatedParticipants.length > 0 && (
        <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            あなたの指名選手
          </h2>

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
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody>
                {nominatedParticipants.map(({ draft, participant }) => {
                  if (!participant) return null;

                  return (
                    <tr
                      key={draft.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-3">{participant.name}</td>
                      <td className="px-4 py-3">{participant.weapon}</td>
                      <td className="px-4 py-3">
                        {participant.xp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {draft.status === "pending" ? (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-xs rounded-md">
                            指名中
                          </span>
                        ) : draft.status === "confirmed" ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-md">
                            確定済み
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md">
                            キャンセル
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => {
                  const isNominated = isParticipantNominated(participant.id);

                  return (
                    <tr
                      key={participant.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-3">{participant.name}</td>
                      <td className="px-4 py-3">{participant.weapon}</td>
                      <td className="px-4 py-3">
                        {participant.xp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasTeams ? (
                          <button
                            onClick={() => handleNominateClick(participant)}
                            disabled={isNominated}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                              isNominated
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {isNominated ? "指名済み" : "指名する"}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ドラフト開始後に指名可能
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 指名確認モーダル */}
      {showConfirmModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">選手指名の確認</h3>

              {nominationError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {nominationError}
                  </p>
                </div>
              )}

              <p className="mb-6">
                <span className="font-semibold">
                  {selectedParticipant.name}
                </span>{" "}
                を指名しますか？
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={handleCancelNomination}
                  disabled={isNominateLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleConfirmNomination}
                  disabled={isNominateLoading}
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition ${
                    isNominateLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isNominateLoading ? (
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
                    "指名する"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
