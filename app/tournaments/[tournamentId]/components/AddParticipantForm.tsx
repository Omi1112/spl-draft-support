// filepath: /workspace/app/tournaments/[tournamentId]/components/AddParticipantForm.tsx
import React, { useState } from 'react';

export interface AddParticipantFormValues {
  name: string;
  weapon: string;
  xp: string;
}

interface AddParticipantFormProps {
  onSubmit: (values: AddParticipantFormValues) => void;
  onClose: () => void;
}

// 参加者追加フォーム（E2Eテストのラベル・構造に準拠）
const AddParticipantForm: React.FC<AddParticipantFormProps> = ({ onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [weapon, setWeapon] = useState('');
  const [xp, setXp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !weapon.trim() || !xp.trim()) {
      setError('全ての項目を入力してください');
      return;
    }
    if (!/^[0-9]+$/.test(xp)) {
      setError('XPは数値で入力してください');
      return;
    }
    onSubmit({ name: name.trim(), weapon: weapon.trim(), xp: xp.trim() });
    setName('');
    setWeapon('');
    setXp('');
    setError(null);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-1">
          名前
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="参加者名"
          required
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="weapon" className="block mb-1">
          使用武器
        </label>
        <input
          id="weapon"
          name="weapon"
          type="text"
          value={weapon}
          onChange={(e) => setWeapon(e.target.value)}
          placeholder="例: シューター"
          required
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="xp" className="block mb-1">
          XP
        </label>
        <input
          id="xp"
          name="xp"
          type="number"
          value={xp}
          onChange={(e) => setXp(e.target.value)}
          placeholder="例: 2000"
          required
          className="border rounded px-2 py-1 w-full"
          min="0"
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-200">
          閉じる
        </button>
        <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">
          追加する
        </button>
      </div>
    </form>
  );
};

export default AddParticipantForm;
