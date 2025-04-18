'use client';

import { useHome } from './hooks/useHome';
import styles from './page.module.css'; // スタイルをインポート
import { formatDate } from './utils/formatDate';

export default function Home() {
  // useHomeカスタムフックで状態管理
  const {
    tournaments,
    loading,
    error,
    openCreateModal,
    isCreateModalOpen,
    closeCreateModal,
    handleCreateTournament,
  } = useHome();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>大会一覧</h1>
      <button className={styles.button} onClick={openCreateModal}>
        大会を作成する
      </button>

      {/* トーナメント作成モーダル */}
      {isCreateModalOpen && (
        <div className={styles.modal}>
          <div className={styles['modal-content']}>
            <h2 className={styles['modal-title']}>大会作成</h2>
            <form onSubmit={handleCreateTournament}>
              <label className={styles.label}>
                大会名:
                <input className={styles.input} name="tournamentName" type="text" required />
              </label>
              <div style={{ marginTop: 8 }}>
                <button className={styles.button} type="submit">
                  作成
                </button>
                <button className={styles.button} type="button" onClick={closeCreateModal}>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : tournaments.length === 0 ? (
        <div>
          <p>登録されている大会はありません</p>
          <button className={styles.button} onClick={openCreateModal}>
            最初の大会を作成する
          </button>
        </div>
      ) : (
        <ul className={styles.list}>
          {tournaments.map((tournament) => (
            <li className={styles.item} key={tournament.id}>
              {tournament.name}（作成日: {formatDate(tournament.createdAt)}）
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
