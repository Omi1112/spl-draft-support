'use client';
// 大会追加用モーダルコンポーネント
import { useState } from 'react';

import { createTournament } from '@/app/client/tournament/createTournament';

/**
 * モーダルのプロパティ
 */
interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTournamentCreated: () => void;
}

/**
 * 大会追加用モーダルコンポーネント
 */
const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  onTournamentCreated,
}) => {
  // フォームの状態
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 大会を作成する関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!name || name.trim() === '') {
      setError('大会名を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTournament({ name });

      // フォームをリセット
      setName('');
      // 親コンポーネントに作成完了を通知
      onTournamentCreated();
      // モーダルを閉じる
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '大会の作成中にエラーが発生しました');
      console.error('大会の作成中にエラーが発生しました:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // モーダルが開いていない場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="create-tournament-modal"
    >
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">新しい大会を作成</h2>
        <form onSubmit={handleSubmit}>
          {/* エラーメッセージ表示を追加 */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded" data-testid="error-message">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="tournament-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              大会名
            </label>
            <input
              type="text"
              id="tournament-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              data-testid="tournament-name-input"
              disabled={isSubmitting} // 送信中は無効化
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              data-testid="cancel-create-tournament-button"
              disabled={isSubmitting} // 送信中は無効化
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!name || isSubmitting} // 送信中は無効化
              data-testid="submit-create-tournament-button"
            >
              {isSubmitting ? '作成中...' : '大会を作成する'} {/* 送信中のテキスト変更 */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournamentModal;
