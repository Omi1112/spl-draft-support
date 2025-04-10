import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { TeamList } from '../../../app/components/tournaments/TeamList';
import { Team } from '../../../app/components/tournaments/types';

// formatDateをモック化
jest.mock('../../../app/utils/formatDate', () => ({
  formatDate: jest.fn(() => '2025年4月7日'),
}));

describe('TeamList', () => {
  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: 'テストチーム1',
      captainId: 'participant-1',
      captain: {
        id: 'participant-1',
        name: 'テスト主将1',
        weapon: 'シューター',
        xp: 2000,
        createdAt: '2025-04-06T00:00:00.000Z',
        isCaptain: true,
      },
      members: [
        {
          id: 'participant-1',
          name: 'テスト主将1',
          weapon: 'シューター',
          xp: 2000,
          createdAt: '2025-04-06T00:00:00.000Z',
          isCaptain: true,
        },
        {
          id: 'participant-2',
          name: 'テストメンバー2',
          weapon: 'チャージャー',
          xp: 2200,
          createdAt: '2025-04-06T00:00:00.000Z',
        },
      ],
      tournamentId: 'tournament-1',
      createdAt: '2025-04-07T00:00:00.000Z',
    },
  ];

  it('チーム一覧が正しく表示されること', () => {
    const { container } = render(<TeamList teams={mockTeams} />);

    // チーム名が表示されていることを確認
    expect(screen.getByText('テストチーム1')).toBeInTheDocument();

    // 主将セクションで主将名が表示されていることを確認
    const captainSection = screen.getByText('主将:').closest('div')!;
    expect(captainSection).not.toBeNull();
    if (captainSection) {
      expect(within(captainSection).getByText('テスト主将1')).toBeInTheDocument();
    }

    // 作成日が表示されていることを確認（テキストの一部を使用）
    expect(screen.getByText(/作成日: 2025年4月7日/)).toBeInTheDocument();

    // メンバー数が表示されていることを確認
    expect(screen.getByText('2人')).toBeInTheDocument();

    // メンバー情報が表示されていることを確認
    expect(screen.getByText('シューター')).toBeInTheDocument();
    expect(screen.getByText('チャージャー')).toBeInTheDocument();
    expect(screen.getByText(/2,000 XP/)).toBeInTheDocument();
    expect(screen.getByText(/2,200 XP/)).toBeInTheDocument();

    // 主将ラベルが表示されていることを確認
    const memberListSection = screen.getByText('メンバー:').parentElement!;
    expect(memberListSection).not.toBeNull();
    if (memberListSection) {
      expect(within(memberListSection).getByText('主将')).toBeInTheDocument();
    }
  });

  it('チームが存在しない場合、適切なメッセージが表示されること', () => {
    render(<TeamList teams={[]} />);

    // チームが存在しない場合のメッセージが表示されていることを確認
    expect(screen.getByText('チームはまだ作成されていません')).toBeInTheDocument();
    expect(
      screen.getByText('キャプテンページからドラフトを開始してチームを作成できます')
    ).toBeInTheDocument();
  });

  it('チームがundefinedの場合、適切なメッセージが表示されること', () => {
    render(<TeamList />);

    // チームが存在しない場合のメッセージが表示されていることを確認
    expect(screen.getByText('チームはまだ作成されていません')).toBeInTheDocument();
    expect(
      screen.getByText('キャプテンページからドラフトを開始してチームを作成できます')
    ).toBeInTheDocument();
  });
});
