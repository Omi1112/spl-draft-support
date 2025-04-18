// 参加者キャプテン化UIの実装
// strictな型チェック・null/undefined安全・日本語コメント
import React from 'react';

import { toggleCaptain, TournamentParticipant } from '@/app/client/tournament/toggleCaptain';

type Props = {
  tournamentId: string;
  participantId: string;
  isCaptain: boolean;
  onToggled?: (participant: TournamentParticipant) => void;
};

export const ToggleCaptainButton: React.FC<Props> = ({
  tournamentId,
  participantId,
  isCaptain,
  onToggled,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await toggleCaptain({ tournamentId, participantId });
      if (onToggled) onToggled(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? 'キャプテン切替に失敗しました');
      } else {
        setError('キャプテン切替に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleClick} disabled={loading}>
        {isCaptain ? 'キャプテン解除' : 'キャプテンにする'}
      </button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </>
  );
};
