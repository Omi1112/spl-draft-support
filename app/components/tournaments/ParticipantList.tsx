// filepath: /workspace/app/components/tournaments/ParticipantList.tsx
// 参加者一覧を表示するコンポーネント

import React from "react";
import Link from "next/link";
import { Participant } from "./types";

interface ParticipantListProps {
  tournamentId: string;
  participants: Participant[];
  onCaptainToggle: (participantId: string) => void;
  onAddParticipant: () => void;
}

export function ParticipantList({
  tournamentId,
  participants,
  onCaptainToggle,
  onAddParticipant,
}: ParticipantListProps) {
  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">参加者一覧</h2>
        <button
          onClick={onAddParticipant}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          参加者を追加
        </button>
      </div>

      {participants.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md text-center">
          <p className="text-gray-600 dark:text-gray-400">
            参加者はまだいません
          </p>
        </div>
      ) : (
        <>
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
                {participants.map((participant) => {
                  const isCaptain = participant.isCaptain || false;

                  return (
                    <React.Fragment key={participant.id}>
                      <tr
                        className={`border-t border-gray-200 dark:border-gray-700 ${
                          isCaptain ? "bg-red-50 dark:bg-red-900/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3">{participant.name}</td>
                        <td className="px-4 py-3">{participant.weapon}</td>
                        <td className="px-4 py-3">
                          {participant.xp.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onCaptainToggle(participant.id)}
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              isCaptain
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {isCaptain ? "主将" : "主"}
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
                              <span>
                                {participant.name}のキャプテンページを表示
                              </span>
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
        </>
      )}
    </div>
  );
}
