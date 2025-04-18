// app/components/tournaments/CreateTournamentModal.tsx
// 大会作成用モーダルコンポーネント
import React, { useState, useRef, useEffect } from 'react';
// 正しいパスに修正（app/client/tournament/createTournament からインポート）
import { createTournament } from '@/app/client/tournament/createTournament';

interface CreateTournamentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

/**
 * 大会作成モーダル
 */
const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('大会名は必須です');
      return;
    }
    if (name.length > 50) {
      setError('大会名は50文字以内で入力してください');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createTournament({ name });
      setLoading(false);
      onCreated?.();
      onClose();
    } catch (e: any) {
      setError(e.message ?? '大会作成に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">大会作成</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring"
            placeholder="大会名を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            aria-label="大会名"
          />
          {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '作成中...' : '作成'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTournamentModal;
