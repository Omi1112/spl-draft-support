// ドラフト開始・リセットUIの実装
// strictな型チェック・null/undefined安全・日本語コメント
import React from 'react';

import { resetDraft } from '@/app/client/captain/resetDraft';
import { startDraft } from '@/app/client/captain/startDraft';

type Props = {
  tournamentId: string;
  draftStarted: boolean;
  onDraftStart?: () => void;
  onDraftReset?: () => void;
};

export const DraftControl: React.FC<Props> = ({
  tournamentId,
  draftStarted,
  onDraftStart,
  onDraftReset,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      await startDraft(tournamentId);
      if (onDraftStart) onDraftStart();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? 'ドラフト開始に失敗しました');
      } else {
        setError('ドラフト開始に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setLoading(true);
    try {
      await resetDraft(tournamentId);
      if (onDraftReset) onDraftReset();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? 'リセットに失敗しました');
      } else {
        setError('リセットに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleStart} disabled={loading || draftStarted}>
        ドラフト開始
      </button>
      {draftStarted && (
        <button onClick={handleReset} disabled={loading}>
          リセット
        </button>
      )}
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};
