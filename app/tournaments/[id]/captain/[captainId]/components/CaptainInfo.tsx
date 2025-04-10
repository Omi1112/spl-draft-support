'use client';

import { Participant } from '../types';

interface CaptainInfoProps {
  captain: Participant;
}

export function CaptainInfo({ captain }: CaptainInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        キャプテン情報
      </h2>

      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        {/* キャプテンのアバター（仮想的な要素） */}
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {captain.name.charAt(0)}
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{captain.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">キャプテン</p>
          </div>
        </div>
      </div>
    </div>
  );
}
