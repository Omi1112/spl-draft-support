"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Tournament,
  ParticipantFormData,
} from "../../../components/tournaments/types";
import {
  fetchTournament,
  addParticipantToTournament,
  setCaptain,
} from "../../../components/tournaments/tournamentClient";

export function useTournamentDetails(tournamentId: string) {
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

  // 大会データの読み込み
  useEffect(() => {
    if (!tournamentId) return;

    async function loadTournament() {
      try {
        setLoading(true);
        const data = await fetchTournament(tournamentId);
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
  }, [tournamentId, router]);

  // 入力フォームの変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParticipantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 参加者追加の送信ハンドラー
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

  // キャプテン設定のトグルハンドラー
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

  return {
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
  };
}