"use client";

import { NominatedParticipantItem } from "../types";

interface NominatedParticipantsListProps {
  nominatedParticipants: NominatedParticipantItem[];
}

export function NominatedParticipantsList({
  nominatedParticipants,
}: NominatedParticipantsListProps) {
  if (nominatedParticipants.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        あなたの指名選手
      </h2>

      <div className="overflow-x-auto">
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
                ステータス
              </th>
            </tr>
          </thead>
          <tbody>
            {nominatedParticipants.map(({ draft, participant }) => {
              if (!participant) return null;

              return (
                <tr
                  key={draft.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-3">{participant.name}</td>
                  <td className="px-4 py-3">{participant.weapon}</td>
                  <td className="px-4 py-3">
                    {participant.xp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {draft.status === "pending" ? (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-xs rounded-md">
                        指名中
                      </span>
                    ) : draft.status === "confirmed" ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-md">
                        確定済み
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md">
                        キャンセル
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
