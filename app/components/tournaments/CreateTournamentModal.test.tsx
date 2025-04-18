import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTournamentModal from '../../../app/components/tournaments/CreateTournamentModal';
import { createTournament } from '../../../app/client/tournament/createTournament';

// モックの設定
jest.mock('../../../app/client/tournament/createTournament');
const mockedCreateTournament = createTournament as jest.MockedFunction<typeof createTournament>;

describe('CreateTournamentModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('モーダルが閉じている場合は何も表示しない', () => {
    const { container } = render(
      <CreateTournamentModal open={false} onClose={mockOnClose} onCreated={mockOnCreated} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('モーダルが開いている場合はフォームを表示する', () => {
    render(<CreateTournamentModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

    expect(screen.getByText('大会作成')).toBeInTheDocument();
    expect(screen.getByLabelText(/大会名/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作成する' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    render(<CreateTournamentModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('バツボタンをクリックするとonCloseが呼ばれる', () => {
    render(<CreateTournamentModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('オーバーレイをクリックするとonCloseが呼ばれる', () => {
    render(<CreateTournamentModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

    // オーバーレイ要素をクリック
    fireEvent.click(screen.getByTestId('overlay'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('空のフォームを送信するとエラーメッセージを表示する', async () => {
    render(<CreateTournamentModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

    // 空のフォームを送信
    fireEvent.click(screen.getByRole('button', { name: '作成する' }));

    // エラーメッセージが表示されることを確認
    expect(await screen.findByText('大会名を入力してください')).toBeInTheDocument();
    expect(mockedCreateTournament).not.toHaveBeenCalled();
  });

  it('フォームを正しく送信するとcreateToursamentが呼ばれる', async () => {
    mockedCreateTournament.mockResolvedValue({
      id: 'new-id',
      name: 'テスト大会',
      createdAt: '2025-04-18T00:00:00.000Z',
    });

    render(<CreateTournamentModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

    // フォームに入力
    fireEvent.change(screen.getByLabelText(/大会名/), { target: { value: 'テスト大会' } });

    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: '作成する' }));

    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(mockedCreateTournament).toHaveBeenCalledWith({ name: 'テスト大会' });
    });

    // 成功時のコールバックが呼ばれることを確認
    await waitFor(() => {
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    mockedCreateTournament.mockRejectedValue(new Error('APIエラー'));

    render(<CreateTournamentModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

    // フォームに入力
    fireEvent.change(screen.getByLabelText(/大会名/), { target: { value: 'テスト大会' } });

    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: '作成する' }));

    // エラーメッセージが表示されることを確認
    expect(await screen.findByText('大会の作成に失敗しました')).toBeInTheDocument();

    // コールバックが呼ばれないことを確認
    expect(mockOnCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
