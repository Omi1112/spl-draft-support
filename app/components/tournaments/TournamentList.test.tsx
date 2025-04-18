// __tests__/components/tournaments/TournamentList.test.tsx
// 大会一覧コンポーネントのユニットテスト
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import * as fetchModule from '@/client/tournament/fetchTournaments';
import TournamentList from '@/components/tournaments/TournamentList';

jest.mock('@/client/tournament/fetchTournaments');

const mockTournaments: fetchModule.Tournament[] = [
  {
    id: '1',
    name: 'テスト大会1',
    createdAt: '2025-04-18T07:00:00Z',
    participants: [{ id: 'p1' }],
    teams: [{ id: 't1' }],
    draftStatus: { round: 1, turn: 1, status: 'inprogress' },
  },
  {
    id: '2',
    name: 'テスト大会2',
    createdAt: '2025-04-18T08:00:00Z',
    participants: [],
    teams: [],
    draftStatus: null,
  },
];

describe('TournamentList', () => {
  it('大会一覧を正しく表示する', async () => {
    (fetchModule.fetchTournaments as jest.Mock).mockResolvedValue(mockTournaments);
    render(<TournamentList />);
    await waitFor(() => {
      expect(screen.getByText('テスト大会1')).toBeInTheDocument();
      expect(screen.getByText('テスト大会2')).toBeInTheDocument();
    });
  });

  it('大会がない場合にメッセージを表示する', async () => {
    (fetchModule.fetchTournaments as jest.Mock).mockResolvedValue([]);
    render(<TournamentList />);
    await waitFor(() => {
      expect(screen.getByText('大会がありません')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージを表示する', async () => {
    (fetchModule.fetchTournaments as jest.Mock).mockRejectedValue(new Error('取得失敗'));
    render(<TournamentList />);
    await waitFor(() => {
      expect(screen.getByText('取得失敗')).toBeInTheDocument();
    });
  });
});
