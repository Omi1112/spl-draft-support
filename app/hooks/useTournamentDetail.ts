// filepath: /workspace/app/hooks/useTournamentDetail.ts
import { useState, useCallback } from 'react';

export interface TournamentDetail {
  id: string;
  name: string;
  createdAt: string;
}
export interface Participant {
  id: string;
  name: string;
  isCaptain: boolean;
}

export function useTournamentDetail(tournamentId: string) {
  // 本来はAPIクライアントから取得するが、ここではダミーデータ
  const [tournament] = useState<TournamentDetail>({
    id: tournamentId,
    name: `Tournament ${tournamentId}`,
    createdAt: '2023-01-01',
  });
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '参加者1', isCaptain: false },
    { id: '2', name: '参加者2', isCaptain: true },
  ]);
  const [loading] = useState(false);
  const [error] = useState('');

  const onAddParticipant = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('participantName') ?? '').trim();
    if (!name) return;
    setParticipants((prev) => [...prev, { id: String(Date.now()), name, isCaptain: false }]);
    form.reset();
  }, []);

  const onMakeCaptain = useCallback((participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isCaptain: true } : p))
    );
  }, []);

  return {
    tournament,
    participants,
    loading,
    error,
    onAddParticipant,
    onMakeCaptain,
  };
}
