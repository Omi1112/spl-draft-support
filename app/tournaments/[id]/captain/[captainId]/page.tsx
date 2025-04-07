"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "../../../../utils/formatDate";

// 分割したコンポーネントとAPI、型定義のインポート
import { Tournament, Participant, Draft, NominatedParticipantItem } from "./types";
import { fetchTournamentData, startDraft, resetDraft, nominateParticipant } from "./api";
import { ConfirmModal } from "./components/ConfirmModal";
import { DraftManagement } from "./components/DraftManagement";
import { CaptainInfo } from "./components/CaptainInfo";
import { NominatedParticipantsList } from "./components/NominatedParticipantsList";
import { UnassignedParticipantsList } from "./components/UnassignedParticipantsList";

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
  
  // 処理状態の管理
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isStartLoading, setIsStartLoading] = useState(false);
  const [isNominateLoading, setIsNominateLoading] = useState(false);
  
  const [hasTeams, setHasTeams] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nominationSuccess, setNominationSuccess] = useState<string | null>(null);
  const [nominationError, setNominationError] = useState<string | null>(null);
  const [currentRoundDraftComplete, setCurrentRoundDraftComplete] = useState(false);
  const [draftStatus, setDraftStatus] = useState<Tournament["draftStatus"]>(undefined);

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

      await nominateParticipant(
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
  const getNominatedParticipants = (): NominatedParticipantItem[] => {
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
      <DraftManagement
        tournament={tournament}
        hasTeams={hasTeams}
        isStartLoading={isStartLoading}
        isResetLoading={isResetLoading}
        onStartDraft={handleStartDraft}
        onResetDraft={handleResetDraft}
      />

      {/* キャプテン情報 */}
      <CaptainInfo captain={captain} />

      {/* 指名済み参加者セクション */}
      <NominatedParticipantsList nominatedParticipants={nominatedParticipants} />

      {/* 参加者一覧セクション */}
      <UnassignedParticipantsList
        participants={participants}
        hasTeams={hasTeams}
        onNominateClick={handleNominateClick}
        isParticipantNominated={isParticipantNominated}
      />

      {/* 指名確認モーダル */}
      <ConfirmModal
        isOpen={showConfirmModal}
        participant={selectedParticipant}
        isLoading={isNominateLoading}
        error={nominationError}
        onConfirm={handleConfirmNomination}
        onCancel={handleCancelNomination}
      />
    </div>
  );
}
