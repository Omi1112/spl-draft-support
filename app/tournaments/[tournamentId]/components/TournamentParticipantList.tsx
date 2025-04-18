// 参加者一覧表示UIコンポーネント
// strictな型チェック・null/undefined安全・日本語コメント
import React from 'react';

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
  onAddParticipant: () => void;
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
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8 mb-10">
      <h2 className="text-xl font-semibold mb-4">参加者一覧</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1">名前</th>
            <th className="px-2 py-1">武器</th>
            <th className="px-2 py-1">XP</th>
            <th className="px-2 py-1">キャプテン</th>
            <th className="px-2 py-1">操作</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id} className="border-b last:border-b-0">
              <td className="px-2 py-1">{p.name}</td>
              <td className="px-2 py-1">{p.weapon}</td>
              <td className="px-2 py-1">{p.xp}</td>
              <td className="px-2 py-1">{p.isCaptain ? '◯' : ''}</td>
              <td className="px-2 py-1">
                <button
                  type="button"
                  className="text-blue-600 hover:underline disabled:opacity-50"
                  onClick={() => onCaptainToggle(p.id)}
                  disabled={processingCaptainId === p.id}
                >
                  {p.isCaptain ? 'キャプテン解除' : 'キャプテンにする'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentParticipantList;
