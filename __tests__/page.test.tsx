import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import { formatDate } from '../app/utils/formatDate';
import { useHome } from '../app/hooks/useHome';

// カスタムフックをモック
jest.mock('../app/hooks/useHome');

// formatDateをモック
jest.mock('../app/utils/formatDate', () => ({
  formatDate: jest.fn(() => '2025年4月7日'),
}));

describe('Home', () => {
  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
  });

  it('ローディング状態が正しく表示されること', () => {
    // ローディング状態をモック
    (useHome as jest.Mock).mockReturnValue({
      tournaments: [],
      loading: true,
      error: null,
    });

    render(<Home />);

    // ローディングインジケーターが表示されていることを確認
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('大会一覧が正しく表示されること', () => {
    // モックデータ
    const mockTournaments = [
      { id: '1', name: 'テスト大会1', createdAt: '2025-04-07T00:00:00.000Z' },
      { id: '2', name: 'テスト大会2', createdAt: '2025-04-06T00:00:00.000Z' },
    ];

    // データ取得成功状態をモック
    (useHome as jest.Mock).mockReturnValue({
      tournaments: mockTournaments,
      loading: false,
      error: null,
    });

    render(<Home />);

    // 大会名が表示されていることを確認
    expect(screen.getByText('テスト大会1')).toBeInTheDocument();
    expect(screen.getByText('テスト大会2')).toBeInTheDocument();

    // 日付がフォーマットされて表示されていることを確認
    expect(screen.getAllByText('作成日: 2025年4月7日')).toHaveLength(2);
    expect(formatDate).toHaveBeenCalledTimes(2);

    // 大会作成リンクが表示されていることを確認
    const createLink = screen.getByText('大会を作成する');
    expect(createLink).toBeInTheDocument();
    expect(createLink.closest('a')).toHaveAttribute('href', '/tournaments/create');

    // 各大会へのリンクが正しいhref属性を持っていることを確認
    const tournamentLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.includes('/tournaments/'))
      .filter((link) => !link.getAttribute('href')?.includes('create'));

    expect(tournamentLinks[0]).toHaveAttribute('href', '/tournaments/1');
    expect(tournamentLinks[1]).toHaveAttribute('href', '/tournaments/2');
  });

  it('大会が存在しない場合、適切なメッセージが表示されること', () => {
    // 空の大会リストをモック
    (useHome as jest.Mock).mockReturnValue({
      tournaments: [],
      loading: false,
      error: null,
    });

    render(<Home />);

    // メッセージが表示されていることを確認
    expect(screen.getByText('登録されている大会はありません')).toBeInTheDocument();

    // 「最初の大会を作成する」リンクが表示されていることを確認
    const createFirstLink = screen.getByText('最初の大会を作成する');
    expect(createFirstLink).toBeInTheDocument();
    expect(createFirstLink.closest('a')).toHaveAttribute('href', '/tournaments/create');
  });

  it('エラー発生時にエラーメッセージが表示されること', () => {
    // エラー状態をモック
    (useHome as jest.Mock).mockReturnValue({
      tournaments: [],
      loading: false,
      error: '大会一覧の取得に失敗しました',
    });

    render(<Home />);

    // エラーメッセージが表示されていることを確認
    const errorMessage = screen.getByText('大会一覧の取得に失敗しました');
    expect(errorMessage).toBeInTheDocument();

    // エラーメッセージ自体のコンテナにスタイルが適用されているため、直接チェック
    const errorContainer = errorMessage.closest('div');
    expect(errorContainer).toHaveClass('bg-red-50');
    expect(errorContainer).toHaveClass('border-red-200');
  });
});
