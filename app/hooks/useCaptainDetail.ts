// filepath: /workspace/app/hooks/useCaptainDetail.ts
import { useState, useCallback } from 'react';

export interface Captain {
  id: string;
  name: string;
}
export interface NominatableParticipant {
  id: string;
  name: string;
}

export function useCaptainDetail(tournamentId: string, captainId: string) {
  // 本来はAPIクライアントから取得するが、ここではダミーデータ
  const [captain] = useState<Captain>({ id: captainId, name: `キャプテン${captainId}` });
  const [nominatableParticipants, setNominatableParticipants] = useState<NominatableParticipant[]>([
    { id: '1', name: '参加者A' },
    { id: '2', name: '参加者B' },
  ]);
  const [loading] = useState(false);
  const [error] = useState('');
  const [isDraftStarted, setIsDraftStarted] = useState(false);

  const onDraftStart = useCallback(() => {
    setIsDraftStarted(true);
  }, []);
  const onDraftReset = useCallback(() => {
    setIsDraftStarted(false);
  }, []);
  const onNominate = useCallback((participantId: string) => {
    setNominatableParticipants((prev) => prev.filter((p) => p.id !== participantId));
  }, []);

  return {
    captain,
    nominatableParticipants,
    loading,
    error,
    onDraftStart,
    onDraftReset,
    onNominate,
    isDraftStarted,
  };
}
