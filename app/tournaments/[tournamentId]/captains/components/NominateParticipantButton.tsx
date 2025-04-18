// 参加者指名UIの実装
// strictな型チェック・null/undefined安全・日本語コメント
import React from 'react';

import { nominateParticipant, Draft } from '@/app/client/captain/nominateParticipant';

type Props = {
  tournamentId: string;
  captainId: string;
  participantId: string;
  onNominated?: (draft: Draft) => void;
};

export const NominateParticipantButton: React.FC<Props> = ({
  tournamentId,
  captainId,
  participantId,
  onNominated,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const draft = await nominateParticipant({ tournamentId, captainId, participantId });
      if (onNominated) onNominated(draft);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? '指名に失敗しました');
      } else {
        setError('指名に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleClick} disabled={loading}>
        指名
      </button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </>
  );
};
