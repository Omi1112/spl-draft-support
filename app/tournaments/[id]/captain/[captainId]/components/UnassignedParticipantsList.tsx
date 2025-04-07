"use client";

import { Participant } from "../types";

interface UnassignedParticipantsListProps {
  participants: Participant[];
  hasTeams: boolean;
  onNominateClick: (participant: Participant) => void;
  isParticipantNominated: (participantId: string) => boolean;
}

export function UnassignedParticipantsList({
  participants,
  hasTeams,
  onNominateClick,
  isParticipantNominated,
}: UnassignedParticipantsListProps) {
  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        未所属の参加者一覧
      </h2>

      {participants.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md text-center">
          <p className="text-gray-600 dark:text-gray-400">
            チームに所属していない参加者はいません！
          </p>
        </div>
      ) : (
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
                  アクション
                </th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => {
                const isNominated = isParticipantNominated(participant.id);

                return (
                  <tr
                    key={participant.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-3">{participant.name}</td>
                    <td className="px-4 py-3">{participant.weapon}</td>
                    <td className="px-4 py-3">
                      {participant.xp.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasTeams ? (
                        <button
                          onClick={() => onNominateClick(participant)}
                          disabled={isNominated}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                            isNominated
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {isNominated ? "指名済み" : "指名する"}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ドラフト開始後に指名可能
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
