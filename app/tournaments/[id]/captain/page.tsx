'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';

import { fetchTournamentCaptains } from './api';
import { ParticipantCard } from './components/ParticipantCard';
import { Tournament } from './types';
import type { Participant } from './types/index';

export default function TournamentCaptainsPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 取得したtournamentData.participantsをローカル変数に
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!tournamentId) return;

    async function loadTournamentCaptains() {
      try {
        setLoading(true);
        const tournamentData = await fetchTournamentCaptains(tournamentId);
        setTournament(tournamentData);
        // participants配列があればセット
        if ('participants' in tournamentData && Array.isArray(tournamentData.participants)) {
          setParticipants(tournamentData.participants);
        } else {
          setParticipants([]);
        }
      } catch (err) {
        console.error('Error fetching tournament captains:', err);
        setError('キャプテンデータの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    loadTournamentCaptains();
  }, [tournamentId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!tournament) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-gray-600 dark:text-gray-300">キャプテン一覧</p>
        </div>
        <Link
          href={`/tournaments/${params.id}`}
          className="mt-4 sm:mt-0 inline-block px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition"
        >
          ← 大会詳細に戻る
        </Link>
      </div>

      {participants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {participants.map((captain) => (
            <ParticipantCard key={captain.id} tournamentId={tournament.id} captain={captain} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            この大会にはキャプテンが登録されていません。
          </p>
        </div>
      )}
    </div>
  );
}
