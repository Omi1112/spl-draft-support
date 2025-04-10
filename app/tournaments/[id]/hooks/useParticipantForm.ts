'use client';

import { useState } from 'react';
import { ParticipantFormData, Tournament } from '../../../components/tournaments/types';
import { addParticipantToTournament } from '../../../client/tournamentClient';
import { createEmptyParticipantForm, createParticipantData } from './tournamentUtils';

/**
 * 参加者フォームの状態管理と送信処理を行うカスタムフック
 */
export function useParticipantForm(
  tournament: Tournament | null,
  onParticipantAdded: () => Promise<void>
) {
  // モーダル表示状態
  const [showModal, setShowModal] = useState(false);

  // 参加者フォームの状態
  const [participantForm, setParticipantForm] = useState<ParticipantFormData>(
    createEmptyParticipantForm()
  );

  // 参加者追加の状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      const participantData = createParticipantData(participantForm);
      await addParticipantToTournament(tournament.id, participantData);

      // データを最新化
      await onParticipantAdded();

      // フォームをリセット
      setParticipantForm(createEmptyParticipantForm());

      // モーダルを閉じる
      setShowModal(false);
    } catch (err) {
      console.error('参加者追加エラー:', err);
      setSubmitError('参加者の追加に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showModal,
    setShowModal,
    participantForm,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
  };
}
