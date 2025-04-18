import React from 'react';
// 型定義（必要最低限）
interface Participant {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  isCaptain?: boolean;
}

import { useMemo } from 'react';
import Link from 'next/link';

export type ParticipantListProps = {
  tournamentId: string;
  participants: Participant[];
  onCaptainToggle: (id: string) => void;
  onAddParticipant: () => void;
  processingCaptainId: string | null;
};

export function ParticipantList({
  tournamentId,
  participants,
  onCaptainToggle,
  onAddParticipant,
  processingCaptainId,
}: ParticipantListProps) {
  // ID順にソートされた参加者リストを生成
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => a.id.localeCompare(b.id));
  }, [participants]);

  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8 mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 bg-blue-500 rounded-sm mr-2" />
          参加者一覧
        </h2>
        <button
          onClick={onAddParticipant}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-medium shadow-sm"
        >
          参加者を追加
        </button>
      </div>

      {sortedParticipants.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md text-center">
          <p className="text-gray-600 dark:text-gray-400">参加者はまだいません</p>
        </div>
      ) : (
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                  名前
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                  使用武器
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                  XP
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600 dark:text-gray-300">
                  主将
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedParticipants.map((participant) => {
                const isCaptain = participant.isCaptain || false;
                const isProcessing = processingCaptainId === participant.id;
                return (
                  <React.Fragment key={participant.id}>
                    <tr
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        isCaptain ? 'bg-red-50 dark:bg-red-900/10 font-bold' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{participant.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{participant.weapon}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {participant.xp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onCaptainToggle(participant.id)}
                          disabled={isProcessing}
                          className={`px-2 py-1 text-xs font-medium rounded transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            isProcessing
                              ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500'
                              : isCaptain
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isProcessing ? (
                            <span className="inline-flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500"
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
                              処理中
                            </span>
                          ) : isCaptain ? (
                            '主将'
                          ) : (
                            '主'
                          )}
                        </button>
                      </td>
                    </tr>
                    {/* キャプテンの場合、そのレコードの直下にキャプテンページへのリンクを表示 */}
                    {isCaptain && (
                      <tr className="bg-red-50/50 dark:bg-red-900/5">
                        <td colSpan={4} className="px-4 py-2">
                          <Link
                            href={`/tournaments/${tournamentId}/captain/${participant.id}`}
                            className="text-sm inline-flex items-center text-red-600 hover:text-red-700 gap-1"
                          >
                            <span>{participant.name}のキャプテンページを表示</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
