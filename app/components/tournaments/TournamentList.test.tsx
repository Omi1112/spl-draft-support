import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TournamentList from '../../../app/components/tournaments/TournamentList';
import { fetchTournaments } from '../../../app/client/tournament/fetchTournaments';

// モックの設定
jest.mock('../../../app/client/tournament/fetchTournaments');
const mockedFetchTournaments = fetchTournaments as jest.MockedFunction<typeof fetchTournaments>;

describe('TournamentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング状態を表示する', () => {
    // fetchTournamentsがまだ解決されない状態をシミュレート
    mockedFetchTournaments.mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve([]);
        }, 1000);
      })
    );

    render(<TournamentList />);

    // ローディングインジケータが表示されていることを確認
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('大会一覧を表示する', async () => {
    // モックデータ
    const mockTournaments = [
      {
        id: 'tournament-1',
        name: 'テスト大会1',
        createdAt: '2025-04-18T09:00:00.000Z',
        participants: [{ id: 'p1' }, { id: 'p2' }],
        teams: [],
        draftStatus: null,
      },
      {
        id: 'tournament-2',
        name: 'テスト大会2',
        createdAt: '2025-04-18T10:00:00.000Z',
        participants: [{ id: 'p3' }],
        teams: [{ id: 't1' }],
        draftStatus: {
          round: 1,
          turn: 2,
          status: 'in_progress',
        },
      },
    ];

    mockedFetchTournaments.mockResolvedValue(mockTournaments);

    render(<TournamentList />);

    // データが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('テスト大会1')).toBeInTheDocument();
      expect(screen.getByText('テスト大会2')).toBeInTheDocument();
    });

    // 正しい情報が表示されていることを確認
    expect(screen.getByText(/参加者: 2人/)).toBeInTheDocument();
    expect(screen.getByText(/チーム: 1チーム/)).toBeInTheDocument();
    expect(screen.getByText(/ドラフト進行中 \(ラウンド1 ターン2\)/)).toBeInTheDocument();
  });

  it('エラーメッセージを表示する', async () => {
    // エラー状態をシミュレート
    mockedFetchTournaments.mockRejectedValue(new Error('APIエラー'));

    render(<TournamentList />);

    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('トーナメント一覧の取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('大会が0件の場合に適切なメッセージを表示する', async () => {
    // 空の配列を返す
    mockedFetchTournaments.mockResolvedValue([]);

    render(<TournamentList />);

    // メッセージが表示されるまで待機
    await waitFor(() => {
      expect(
        screen.getByText(
          '大会が登録されていません。「大会作成」ボタンから新しい大会を作成してください。'
        )
      ).toBeInTheDocument();
    });
  });
});
