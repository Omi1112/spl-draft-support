// 指名可能なトーナメント参加者一覧UIの実装（TournamentParticipant型利用）
// strictな型チェック・null/undefined安全・日本語コメント
import React from 'react';

import { TournamentParticipant } from '@/app/client/captain/types';

type Props = {
  tournamentParticipants: TournamentParticipant[];
  onNominate: (participantId: string) => void;
};

export const NominatableTournamentParticipantsList: React.FC<Props> = ({
  tournamentParticipants,
  onNominate,
}) => {
  if (!tournamentParticipants.length) return <div>指名可能な参加者はいません</div>;
  return (
    <ul>
      {tournamentParticipants.map((tp) => (
        <li key={tp.id}>
          {tp.participant.name}（XP: {tp.participant.xp}）
          <button onClick={() => onNominate(tp.participant.id)}>指名</button>
        </li>
      ))}
    </ul>
  );
};
