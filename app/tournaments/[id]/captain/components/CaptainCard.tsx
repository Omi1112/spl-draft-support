"use client";

import Link from 'next/link';
import { formatDate } from '../../../../utils/formatDate';
import { Captain } from '../types';

interface CaptainCardProps {
  tournamentId: string;
  captain: Captain;
}

export function CaptainCard({ tournamentId, captain }: CaptainCardProps) {
  return (
    <Link 
      href={`/tournaments/${tournamentId}/captain/${captain.id}`}
      className="block bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 transition hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
    >
      <div className="flex items-center gap-4">
        {/* キャプテンのアバター（仮想的な要素） */}
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
          {captain.name.charAt(0)}
        </div>
        
        <div className="flex-1">
          <h2 className="text-lg font-medium mb-1">{captain.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            武器: {captain.weapon}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">XP: {captain.xp.toLocaleString()}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              参加日: {formatDate(captain.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}