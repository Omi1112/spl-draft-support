// filepath: /workspace/__tests__/app/tournaments/[tournamentId]/page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';

import TournamentDetailPage from '@/app/tournaments/[tournamentId]/page';

describe('TournamentDetailPage', () => {
  const params = { tournamentId: '1' };

  it('トーナメント詳細情報が表示される', () => {
    render(<TournamentDetailPage params={params} />);
    expect(screen.getByText('Tournament 1 の詳細')).toBeInTheDocument();
    expect(screen.getByText('作成日: 2023-01-01')).toBeInTheDocument();
  });

  it('参加者一覧が表示される', () => {
    render(<TournamentDetailPage params={params} />);
    expect(screen.getByText('参加者1')).toBeInTheDocument();
    expect(screen.getByText('参加者2')).toBeInTheDocument();
  });

  it('参加者追加ができる', () => {
    render(<TournamentDetailPage params={params} />);
    fireEvent.change(screen.getByPlaceholderText('参加者名'), { target: { value: '新参加者' } });
    fireEvent.click(screen.getByText('参加者追加'));
    expect(screen.getByText('新参加者')).toBeInTheDocument();
  });

  it('参加者をキャプテンにできる', () => {
    render(<TournamentDetailPage params={params} />);
    const btn = screen.getAllByText('キャプテンにする')[0];
    fireEvent.click(btn);
    expect(screen.getAllByText('（キャプテン）').length).toBeGreaterThan(0);
  });
});
