'use client';
// app/components/tournaments/CreateTournamentModal.tsx
// 大会作成用のモーダルコンポーネント

import { useState } from 'react';
import { createTournament, CreateTournamentInput } from '../../client/tournament/createTournament';

interface CreateTournamentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTournamentModal({
  open,
  onClose,
  onCreated,
}: CreateTournamentModalProps) {
  // フォームの状態
  const [formData, setFormData] = useState<CreateTournamentInput>({
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 入力変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('大会名を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createTournament(formData);

      // フォームリセット
      setFormData({ name: '' });
      // 作成完了後にコールバック呼び出し
      onCreated();
      // モーダルを閉じる
      onClose();
    } catch (err) {
      console.error('大会作成エラー:', err);
      setError('大会の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // モーダルが表示されていない場合は何も描画しない
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        data-testid="overlay"
      ></div>

      {/* モーダルコンテンツ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 w-full max-w-md mx-4 overflow-hidden transform transition-all">
        {/* ヘッダー */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">大会作成</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isSubmitting}
          >
            <span className="sr-only">閉じる</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              大会名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="例: 第1回スプラトゥーン大会"
              disabled={isSubmitting}
            />
          </div>

          {/* 操作ボタン */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '作成中...' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
