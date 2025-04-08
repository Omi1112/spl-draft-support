// filepath: /workspace/app/components/tournaments/TournamentInfo.tsx
// トーナメント（大会）の基本情報を表示するコンポーネント

import React from "react";
import { Tournament } from "./types";

interface TournamentInfoProps {
  tournament: Tournament;
}

export function TournamentInfo({ tournament }: TournamentInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        大会情報
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-2">
        大会ID: {tournament.id}
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        参加者数: {tournament.participants.length}人
      </p>
    </div>
  );
}
