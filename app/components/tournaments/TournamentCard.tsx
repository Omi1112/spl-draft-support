// app/components/tournaments/TournamentCard.tsx
// 大会カードコンポーネント
import React from 'react';
import type { Tournament } from '@/app/client/tournament/fetchTournaments';

interface TournamentCardProps {
  tournament: Tournament;
  onClick?: (id: string) => void;
}

/**
 * 大会情報をカード形式で表示するコンポーネント
 */
const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onClick }) => {
  return (
    <div
      className="rounded-lg shadow-md p-4 bg-white hover:shadow-xl transition cursor-pointer border border-gray-200"
      onClick={() => onClick?.(tournament.id)}
      tabIndex={0}
      role="button"
      aria-pressed="false"
      style={{ minWidth: 240, maxWidth: 400 }}
    >
      <h2 className="text-xl font-bold mb-2 truncate">{tournament.name}</h2>
      <div className="text-xs text-gray-500 mb-1">
        作成日: {new Date(tournament.createdAt).toLocaleString()}
      </div>
      <div className="flex gap-4 text-sm">
        <span>参加者: {tournament.participants?.length ?? 0}人</span>
        <span>チーム: {tournament.teams?.length ?? 0}組</span>
      </div>
      {tournament.draftStatus && (
        <div className="mt-2 text-xs text-blue-600">
          Draft: {tournament.draftStatus.status} (R{tournament.draftStatus.round}/T
          {tournament.draftStatus.turn})
        </div>
      )}
    </div>
  );
};

export default TournamentCard;
