"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "../../utils/formatDate";

// フックのインポート
import { useTournamentDetails } from "./hooks/useTournamentDetails";

// コンポーネントのインポート
import { TournamentInfo } from "../../components/tournaments/TournamentInfo";
import { TeamList } from "../../components/tournaments/TeamList";
import { ParticipantList } from "../../components/tournaments/ParticipantList";
import { AddParticipantModal } from "../../components/tournaments/AddParticipantModal";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";

export default function TournamentDetails() {
  const params = useParams();
  const id = params.id as string;

  // カスタムフックから状態と関数を取得
  const {
    tournament,
    loading,
    error,
    showModal,
    setShowModal,
    participantForm,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCaptainToggle,
  } = useTournamentDetails(id);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
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
      <TournamentInfo tournament={tournament} />

      {/* チーム一覧セクション */}
      <TeamList teams={tournament.teams} />

      {/* 参加者一覧セクション */}
      <ParticipantList
        tournamentId={tournament.id}
        participants={tournament.participants}
        onCaptainToggle={handleCaptainToggle}
        onAddParticipant={() => setShowModal(true)}
      />

      {/* 参加者追加モーダル */}
      <AddParticipantModal
        isOpen={showModal}
        isSubmitting={isSubmitting}
        error={submitError}
        formData={participantForm}
        onClose={() => setShowModal(false)}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
