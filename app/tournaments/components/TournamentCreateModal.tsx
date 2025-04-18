// トーナメント作成モーダルUIコンポーネント
// strictな型チェック・null/undefined安全・日本語コメント
import React, { useState } from 'react';

import { createTournament, Tournament } from '@/app/client/tournament/createTournament';

// props型定義
type Props = {
  onCreated?: (tournament: Tournament) => void;
  onClose?: () => void;
  isOpen: boolean;
};

export const TournamentCreateModal: React.FC<Props> = ({ isOpen, onCreated, onClose }) => {
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('トーナメント名は必須です');
      return;
    }
    setLoading(true);
    try {
      const tournament = await createTournament({ name: name.trim() });
      setName('');
      if (onCreated) onCreated(tournament);
      if (onClose) onClose();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message ?? '作成に失敗しました');
      } else {
        setError('作成に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>トーナメント作成</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="トーナメント名"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            作成
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            キャンセル
          </button>
        </form>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      {/* style jsx→styleに修正（Next.jsのstyled-jsxはpropsにjsx属性を付与するため警告の原因となる）*/}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          min-width: 320px;
        }
      `}</style>
    </div>
  );
};
