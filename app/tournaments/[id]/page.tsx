"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "../../utils/formatDate";

// コンポーネントのインポート
import { TournamentInfo } from "../../components/tournaments/TournamentInfo";
import { TeamList } from "../../components/tournaments/TeamList";
import { ParticipantList } from "../../components/tournaments/ParticipantList";
import { AddParticipantModal } from "../../components/tournaments/AddParticipantModal";

// 型定義とクライアント関数のインポート
import {
  fetchTournament,
  addParticipantToTournament,
  setCaptain,
} from "../../components/tournaments/tournamentClient";
import {
  Tournament,
  ParticipantFormData,
} from "../../components/tournaments/types";

export default function TournamentDetails() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル表示状態
  const [showModal, setShowModal] = useState(false);

  // 参加者フォームの状態
  const [participantForm, setParticipantForm] = useState<ParticipantFormData>({
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
          const captainIds = data.captains?.map((captain) => captain.id) || [];
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

      // キャプテン情報をもとに参加者データに isCaptain フラグを追加
      const captainIds =
        updatedTournament.captains?.map((captain) => captain.id) || [];
      const participantsWithCaptainFlag = updatedTournament.participants.map(
        (p) => ({
          ...p,
          isCaptain: captainIds.includes(p.id),
        })
      );

      setTournament({
        ...updatedTournament,
        participants: participantsWithCaptainFlag,
      });

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
        const captainIds =
          updatedTournament.captains?.map((captain) => captain.id) || [];
        const participantsWithCaptainFlag = updatedTournament.participants.map(
          (p) => ({
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
