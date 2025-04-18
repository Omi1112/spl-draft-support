// filepath: /workspace/app/tournaments/[tournamentId]/captains/[captainId]/page.tsx
'use client';

import { useCaptainDetail } from '../../../../hooks/useCaptainDetail';

export default function CaptainDetailPage({
  params,
}: {
  params: { tournamentId: string; captainId: string };
}) {
  const {
    captain,
    nominatableParticipants,
    loading,
    error,
    onDraftStart,
    onDraftReset,
    onNominate,
    isDraftStarted,
  } = useCaptainDetail(params.tournamentId, params.captainId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!captain) return <div>キャプテンが見つかりません</div>;

  return (
    <main>
      <h1>キャプテン詳細: {captain.name}</h1>
      <div>
        {isDraftStarted ? (
          <>
            <span>ドラフト中</span>
            <button onClick={onDraftReset}>リセット</button>
          </>
        ) : (
          <button onClick={onDraftStart}>ドラフト開始</button>
        )}
      </div>
      <h2>指名可能な参加者一覧</h2>
      <ul>
        {nominatableParticipants.map((p) => (
          <li key={p.id}>
            {p.name}
            <button onClick={() => onNominate(p.id)}>指名</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
