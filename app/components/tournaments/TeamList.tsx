// filepath: /workspace/app/components/tournaments/TeamList.tsx
// チーム一覧を表示するコンポーネント

import React from "react";
import { Team } from "./types";
import { formatDate } from "../../utils/formatDate";

interface TeamListProps {
  teams?: Team[];
}

export function TeamList({ teams }: TeamListProps) {
  const hasTeams = teams && teams.length > 0;

  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        チーム一覧
      </h2>

      {!hasTeams ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md text-center">
          <p className="text-gray-600 dark:text-gray-400">
            チームはまだ作成されていません
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            キャプテンページからドラフトを開始してチームを作成できます
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{team.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    作成日: {formatDate(team.createdAt)}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md">
                  {team.members.length}人
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    主将:
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {team.captain.name}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  メンバー:
                </h4>
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {team.captainId === member.id && (
                          <span className="text-xs px-1 py-0.5 bg-red-500 text-white rounded">
                            主将
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-2">{member.weapon}</span>
                        <span>{member.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
