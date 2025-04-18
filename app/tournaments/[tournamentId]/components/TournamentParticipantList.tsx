// 参加者一覧表示UIコンポーネント
// strictな型チェック・null/undefined安全・日本語コメント
import React from 'react';
import styles from './TournamentParticipantList.module.css';

type Participant = {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  isCaptain?: boolean;
};

type Props = {
  tournamentId: string;
  participants: Participant[];
  onCaptainToggle: (id: string) => void;
  onAddParticipant?: () => void;
  processingCaptainId: string | null;
};

export const TournamentParticipantList: React.FC<Props> = ({
  tournamentId,
  participants,
  onCaptainToggle,
  onAddParticipant,
  processingCaptainId,
}) => {
  if (!participants || participants.length === 0) {
    return <div>参加者がいません</div>;
  }

  return (
    <div className={`${styles.variables} ${styles.wrapper}`}>
      <div className={styles.headerContainer}>
        {' '}
        {/* ヘッダーとボタンを横並びにするためのコンテナ */}
        <h2 className={styles.header}>参加者一覧</h2>
        {onAddParticipant && (
          <button type="button" onClick={onAddParticipant} className={styles.addButton}>
            ➕ 参加者追加
          </button>
        )}
      </div>
      <div className={styles.container}>
        {participants.map((p) => (
          <div key={p.id} className={`${styles.card} ${p.isCaptain ? styles.captainCard : ''}`}>
            <div className={styles.name}>
              {p.name}
              {p.isCaptain && <span className={styles.captainBadge}>キャプテン</span>}
            </div>
            <div className={styles.info}>
              <span className={styles.infoLabel}>武器</span>
              <span>{p.weapon}</span>
            </div>
            <div className={styles.info}>
              <span className={styles.infoLabel}>XP</span>
              <span>{p.xp}</span>
            </div>
            <button
              type="button"
              className={styles.button}
              onClick={() => onCaptainToggle(p.id)}
              disabled={processingCaptainId === p.id}
            >
              {p.isCaptain ? 'キャプテン解除' : 'キャプテンにする'}
              {processingCaptainId === p.id && '...'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentParticipantList;
