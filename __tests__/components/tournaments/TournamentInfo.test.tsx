import React from 'react';
import { render, screen } from '@testing-library/react';
import { TournamentInfo } from '../../../app/components/tournaments/TournamentInfo';
import { Tournament } from '../../../app/components/tournaments/types';

describe('TournamentInfo', () => {
  const mockTournament: Tournament = {
    id: 'test-id-123',
    name: 'テスト大会',
    createdAt: '2025-04-07T00:00:00.000Z',
    participants: [
      {
        id: 'participant-1',
        name: 'テスト参加者1',
        weapon: 'シューター',
        xp: 2000,
        createdAt: '2025-04-06T00:00:00.000Z',
      },
      {
        id: 'participant-2',
        name: 'テスト参加者2',
        weapon: 'チャージャー',
        xp: 2200,
        createdAt: '2025-04-06T00:00:00.000Z',
      },
    ],
  };

  it('大会IDと参加者数が正しく表示されること', () => {
    render(<TournamentInfo tournament={mockTournament} />);

    // 大会IDが表示されていることを確認
    expect(screen.getByText(/大会ID: test-id-123/)).toBeInTheDocument();

    // 参加者数が正しく表示されていることを確認
    expect(screen.getByText(/参加者数: 2人/)).toBeInTheDocument();
  });

  it('大会情報のヘッダーが表示されること', () => {
    render(<TournamentInfo tournament={mockTournament} />);

    expect(screen.getByText('大会情報')).toBeInTheDocument();
  });

  it('コンポーネントが適切なスタイルクラスを持っていること', () => {
    const { container } = render(<TournamentInfo tournament={mockTournament} />);

    // メインコンテナのクラス
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-white');
    expect(mainDiv).toHaveClass('rounded-lg');
    expect(mainDiv).toHaveClass('shadow-sm');

    // ヘッダー要素のクラス
    const header = screen.getByText('大会情報');
    expect(header).toHaveClass('text-xl');
    expect(header).toHaveClass('font-semibold');
    expect(header).toHaveClass('border-b');
  });

  it('参加者が0人の場合も正しく表示されること', () => {
    const emptyTournament: Tournament = {
      ...mockTournament,
      participants: [],
    };

    render(<TournamentInfo tournament={emptyTournament} />);

    expect(screen.getByText('参加者数: 0人')).toBeInTheDocument();
  });
});
