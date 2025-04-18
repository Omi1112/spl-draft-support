// TournamentListコンポーネントのテスト
import { render, screen, waitFor } from '@testing-library/react';

import { fetchTournaments } from '@/app/client/tournament/fetchTournaments';
import TournamentList from '@/app/components/tournaments/TournamentList';

// fetchTournamentsをモック
jest.mock('@/app/client/tournament/fetchTournaments');

describe('TournamentList', () => {
  const mockTournaments = [
    {
      id: '1',
      name: 'テスト大会1',
      createdAt: '2025-04-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'テスト大会2',
      createdAt: '2025-04-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング状態が表示される', () => {
    // APIリクエストを保留状態のままにする
    (fetchTournaments as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<TournamentList />);

    // ローディングインジケータが表示されていることを確認
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('大会一覧が正常に表示される', async () => {
    // 成功レスポンスをモック
    (fetchTournaments as jest.Mock).mockResolvedValue(mockTournaments);

    render(<TournamentList />);

    // データが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // 各大会名が表示されていることを確認
    expect(screen.getByText('テスト大会1')).toBeInTheDocument();
    expect(screen.getByText('テスト大会2')).toBeInTheDocument();

    // テーブル行がクリック可能になっていることを確認（role="link"属性の確認）
    const tableRows = screen.getAllByRole('link');
    expect(tableRows.length).toBe(2);
  });

  it('エラー状態が表示される', async () => {
    // エラーレスポンスをモック
    (fetchTournaments as jest.Mock).mockRejectedValue(new Error('APIエラー'));

    render(<TournamentList />);

    // エラーメッセージが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });

    // エラーの詳細と再読み込みボタンが表示されていることを確認
    expect(screen.getByText('APIエラー')).toBeInTheDocument();
    expect(screen.getByText('再読み込み')).toBeInTheDocument();
  });

  it('データが空の場合、適切なメッセージが表示される', async () => {
    // 空のデータをモック
    (fetchTournaments as jest.Mock).mockResolvedValue([]);

    render(<TournamentList />);

    // メッセージが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('大会が登録されていません')).toBeInTheDocument();
    });
  });
});
