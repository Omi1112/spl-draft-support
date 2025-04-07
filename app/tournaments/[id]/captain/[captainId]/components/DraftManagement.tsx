"use client";

import { Tournament } from "../types";
import Link from "next/link";

interface DraftManagementProps {
  tournament: Tournament;
  hasTeams: boolean;
  isStartLoading: boolean;
  isResetLoading: boolean;
  onStartDraft: () => Promise<void>;
  onResetDraft: () => Promise<void>;
}

export function DraftManagement({
  tournament,
  hasTeams,
  isStartLoading,
  isResetLoading,
  onStartDraft,
  onResetDraft,
}: DraftManagementProps) {
  return (
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
              onClick={onStartDraft}
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
              onClick={onResetDraft}
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
            href={`/tournaments/${tournament.id}/teams`}
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
  );
}
