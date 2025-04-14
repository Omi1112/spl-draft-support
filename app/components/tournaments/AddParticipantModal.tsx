// filepath: /workspace/app/components/tournaments/AddParticipantModal.tsx
// 参加者追加モーダル

import React from 'react';

import { ParticipantFormData } from './types';

interface AddParticipantModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  formData: ParticipantFormData;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddParticipantModal({
  isOpen,
  isSubmitting,
  error,
  formData,
  onClose,
  onChange,
  onSubmit,
}: AddParticipantModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-850 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">参加者を追加</h2>
            <button
              onClick={onClose}
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

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 rounded-md mb-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
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
                value={formData.name}
                onChange={onChange}
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
                value={formData.weapon}
                onChange={onChange}
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
                value={formData.xp}
                onChange={onChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                placeholder="経験値ポイント"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? '送信中...' : '追加する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
