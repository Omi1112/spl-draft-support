// CreateTournamentModalコンポーネントのテスト
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { createTournament } from '@/app/client/tournament/createTournament';
import CreateTournamentModal from '@/app/components/tournaments/CreateTournamentModal';

// コンソールエラーをモック化（テスト出力を整理するため）
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// createTournamentをモック
jest.mock('@/app/client/tournament/createTournament');

describe('CreateTournamentModal', () => {
  // モーダルのプロパティ用のモック関数
  const mockOnClose = jest.fn();
  const mockOnTournamentCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('モーダルが開いていない場合、何も表示されない', () => {
    render(
      <CreateTournamentModal
        isOpen={false}
        onClose={mockOnClose}
        onTournamentCreated={mockOnTournamentCreated}
      />
    );

    // モーダルのタイトルが存在しないことを確認
    expect(screen.queryByText('大会を作成する')).not.toBeInTheDocument();
  });

  it('モーダルが開いている場合、フォームが表示される', () => {
    render(
      <CreateTournamentModal
        isOpen={true}
        onClose={mockOnClose}
        onTournamentCreated={mockOnTournamentCreated}
      />
    );

    // モーダルのタイトルとフォーム要素が表示されていることを確認
    // h2要素のモーダルタイトルを取得
    expect(screen.getByRole('heading', { name: '大会を作成する' })).toBeInTheDocument();
    expect(screen.getByLabelText(/大会名/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /大会を作成する/ })).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    render(
      <CreateTournamentModal
        isOpen={true}
        onClose={mockOnClose}
        onTournamentCreated={mockOnTournamentCreated}
      />
    );

    // 閉じるボタン（×アイコン）をクリック
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    // onClose関数が呼ばれたことを確認
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    render(
      <CreateTournamentModal
        isOpen={true}
        onClose={mockOnClose}
        onTournamentCreated={mockOnTournamentCreated}
      />
    );

    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    // onClose関数が呼ばれたことを確認
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  it('大会名が空の場合、エラーメッセージが表示される', async () => {
    // コンポーネントをレンダリング
    render(
      <CreateTournamentModal
        isOpen={true}
        onClose={mockOnClose}
        onTournamentCreated={mockOnTournamentCreated}
      />
    );

    // フォーム要素を取得
    const form = screen.getByRole('form');

    // モック関数のリセット
    jest.clearAllMocks();

    // イベントを発火して状態更新を待つ（actで囲む）
    await act(async () => {
      // フォームを直接送信する（submitイベントを発火）
      fireEvent.submit(form);
    });

    // データ属性を使ってエラーメッセージコンテナを検索
    const errorContainer = await screen.findByText(
      '大会名を入力してください',
      {},
      { timeout: 1000 }
    );
    expect(errorContainer).toBeInTheDocument();

    // APIが呼ばれていないことを確認
    expect(createTournament).not.toHaveBeenCalled();
  });

  it('フォームが正常に送信され、APIが呼ばれる', async () => {
    // モックの結果
    const mockResult = { id: '1', name: 'テスト大会', createdAt: '2025-04-18T12:00:00Z' };
    (createTournament as jest.Mock).mockResolvedValue(mockResult);

    render(
      <CreateTournamentModal
        isOpen={true}
        onClose={mockOnClose}
        onTournamentCreated={mockOnTournamentCreated}
      />
    );

    // 大会名を入力
    const nameInput = screen.getByLabelText(/大会名/);
    fireEvent.change(nameInput, { target: { value: 'テスト大会' } });

    // フォームを送信
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // APIが正しいパラメータで呼ばれたことを確認
    expect(createTournament).toHaveBeenCalledWith({ name: 'テスト大会' });

    // 処理完了を待つ
    await waitFor(() => {
      // onTournamentCreated関数が呼ばれたことを確認
      expect(mockOnTournamentCreated).toHaveBeenCalledTimes(1);
      // onClose関数が呼ばれたことを確認
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('API呼び出しでエラーが発生した場合、エラーメッセージが表示される', async () => {
    // APIエラーをシミュレート
    (createTournament as jest.Mock).mockRejectedValue(new Error('APIエラー'));

    render(
      <CreateTournamentModal
        isOpen={true}
        onClose={mockOnClose}
        onTournamentCreated={mockOnTournamentCreated}
      />
    );

    // 大会名を入力
    const nameInput = screen.getByLabelText(/大会名/);
    fireEvent.change(nameInput, { target: { value: 'テスト大会' } });

    // フォームを送信
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // エラーメッセージが表示されることを確認
    expect(await screen.findByText('APIエラー')).toBeInTheDocument();

    // コールバック関数が呼ばれていないことを確認
    expect(mockOnTournamentCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
