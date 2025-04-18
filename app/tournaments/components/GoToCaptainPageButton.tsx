// キャプテンページ遷移処理の実装
// strictな型チェック・null/undefined安全・日本語コメント
import { useRouter } from 'next/navigation';
import React from 'react';

type Props = {
  captainId: string;
};

export const GoToCaptainPageButton: React.FC<Props> = ({ captainId }) => {
  const router = useRouter();
  const handleClick = () => {
    if (!captainId) return;
    router.push(`/captains/${captainId}`);
  };
  return (
    <button onClick={handleClick} disabled={!captainId}>
      キャプテンページへ
    </button>
  );
};
