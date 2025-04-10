import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CreateTournament from '../../../app/tournaments/create/page';

// Next.jsのuseRouterフックをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// fetchをモック
global.fetch = jest.fn();

describe('CreateTournament', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // useRouterのモックをリセット
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // fetchのモックをリセット
    (global.fetch as jest.Mock).mockReset();
  });

  it('大会作成フォームが正しく表示されること', () => {
    render(<CreateTournament />);

    // ヘッダーが表示されていることを確認
    expect(screen.getByText('大会を作成')).toBeInTheDocument();
    expect(screen.getByText('新しい大会名を入力してください')).toBeInTheDocument();

    // フォーム要素が表示されていることを確認
    expect(screen.getByLabelText(/大会名/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例: 第10回サッカー選手権大会')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '大会を作成する' })).toBeInTheDocument();

    // 戻るリンクが表示されていることを確認
    const backLink = screen.getByText('← トップページへ戻る');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('フォームに大会名を入力できること', () => {
    render(<CreateTournament />);

    const nameInput = screen.getByLabelText(/大会名/) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'テスト大会2025' } });

    expect(nameInput.value).toBe('テスト大会2025');
  });

  it('大会作成が成功した場合、詳細ページにリダイレクトすること', async () => {
    // 成功応答をモック
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        data: {
          createTournament: {
            id: 'new-tournament-123',
            name: 'テスト大会2025',
            createdAt: '2025-04-07T12:34:56.789Z',
          },
        },
      }),
    });

    render(<CreateTournament />);

    // フォームに入力して送信
    const nameInput = screen.getByLabelText(/大会名/);
    fireEvent.change(nameInput, { target: { value: 'テスト大会2025' } });

    const submitButton = screen.getByRole('button', { name: '大会を作成する' });
    fireEvent.click(submitButton);

    // 送信中のテキストが表示されることを確認
    expect(screen.getByText('送信中...')).toBeInTheDocument();

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('テスト大会2025'),
        })
      );
    });

    // リダイレクトが実行されたことを確認
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tournaments/new-tournament-123');
    });
  });

  it('大会作成が失敗した場合、エラーメッセージを表示すること', async () => {
    // mockPushが呼び出されないことを確認するためにモックをリセット
    mockPush.mockReset();

    // Fetchモックをリセット
    (global.fetch as jest.Mock).mockReset();

    // APIエラーをシミュレート
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API request failed'));

    render(<CreateTournament />);

    // フォームに入力して送信
    const nameInput = screen.getByLabelText(/大会名/);
    fireEvent.change(nameInput, { target: { value: 'テスト大会2025' } });

    const submitButton = screen.getByRole('button', { name: '大会を作成する' });
    fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(
        screen.getByText('大会の作成に失敗しました。もう一度お試しください。')
      ).toBeInTheDocument();
    });

    // リダイレクトが実行されていないことを確認
    expect(mockPush).not.toHaveBeenCalled();

    // エラー後にフォームが再度送信可能になることを確認
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '大会を作成する' })).toBeEnabled();
    });
  });

  it('GraphQLエラーの場合、エラーメッセージを表示すること', async () => {
    // GraphQLエラー応答をモック
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        errors: [{ message: 'GraphQLエラー: 大会名が既に存在します' }],
      }),
    });

    render(<CreateTournament />);

    // フォームに入力して送信
    const nameInput = screen.getByLabelText(/大会名/);
    fireEvent.change(nameInput, { target: { value: 'テスト大会2025' } });

    const submitButton = screen.getByRole('button', { name: '大会を作成する' });
    fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(
        screen.getByText('大会の作成に失敗しました。もう一度お試しください。')
      ).toBeInTheDocument();
    });
  });
});
