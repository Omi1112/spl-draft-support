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
    <>
      {/* モーダルオーバーレイ */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* モーダル */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full md:w-3/4 lg:w-1/2 mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* モーダルヘッダー */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-lg font-semibold">大会を作成する</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* モーダルコンテンツ */}
          <form onSubmit={handleSubmit} role="form">
            <div className="p-6">
              {/* エラーメッセージ */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* 大会名入力 */}
              <div className="mb-4">
                <label
                  htmlFor="tournament-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  大会名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="tournament-name"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="大会名を入力してください"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
                    作成中...
                  </span>
                ) : (
                  '大会を作成する'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTournamentModal;
