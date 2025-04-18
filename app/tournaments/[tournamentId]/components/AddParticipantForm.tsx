// 参加者追加UIの実装
// strictな型チェック・null/undefined安全・日本語コメント
import React, { useState } from 'react';

import {
  addParticipantToTournament,
  AddParticipantInput,
  TournamentParticipant,
} from '@/app/client/tournament/addParticipantToTournament';

type Props = {
  tournamentId: string;
  onAdded?: (participant: TournamentParticipant) => void;
};
export const AddParticipantForm: React.FC<Props> = ({ tournamentId, onAdded }) => {
  const [name, setName] = useState('');
  const [weapon, setWeapon] = useState('');
  const [xp, setXp] = useState<number | ''>('');
  const [isCaptain, setIsCaptain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !weapon.trim() || xp === '') {
      setError('全ての項目を入力してください');
      return;
    }
    setLoading(true);
    try {
      const input: AddParticipantInput = {
        tournamentId,
        participant: {
          name: name.trim(),
          weapon: weapon.trim(),
          xp: Number(xp),
          isCaptain,
        },
      };
      const participant = await addParticipantToTournament(input);
      setName('');
      setWeapon('');
      setXp('');
      setIsCaptain(false);
      if (onAdded) onAdded(participant);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? '追加に失敗しました');
      } else {
        setError('追加に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        disabled={loading}
        onChange={(e) => setName(e.target.value)}
        placeholder="参加者名"
      />
      <input
        type="text"
        value={weapon}
        disabled={loading}
        onChange={(e) => setWeapon(e.target.value)}
        placeholder="武器"
      />
      <input
        type="number"
        value={xp}
        disabled={loading}
        onChange={(e) => setXp(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder="XP"
      />
      <label>
        <input
          type="checkbox"
          disabled={loading}
          checked={isCaptain}
          onChange={(e) => setIsCaptain(e.target.checked)}
        />{' '}
        キャプテンにする
      </label>
      <button type="submit" disabled={loading}>
        追加
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};
