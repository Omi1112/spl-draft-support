import { renderHook, act } from '@testing-library/react';
import { useCaptainManagement } from '../../../../app/tournaments/[id]/hooks/useCaptainManagement';
import { toggleCaptain } from '../../../../app/client/tournamentClient';
import { Tournament } from '../../../../app/components/tournaments/types';

// モックの設定
jest.mock('../../../../app/client/tournamentClient', () => ({
  toggleCaptain: jest.fn(),
}));

describe('useCaptainManagement', () => {
  const mockTournament: Tournament = {
    id: '1',
    name: 'テストトーナメント',
    createdAt: '2025-04-07T00:00:00.000Z',
    participants: [],
  };

  // 正しい型のモック関数を作成
  const mockOnCaptainUpdated = jest.fn().mockImplementation(async (_skipLoading?: boolean) => {
    return Promise.resolve();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態では処理中状態がnullであること', () => {
    const { result } = renderHook(() => useCaptainManagement(mockTournament, mockOnCaptainUpdated));

    expect(result.current.isProcessing).toBeNull();
  });

  it('handleCaptainToggleが正しく動作すること', async () => {
    // API呼び出しが成功するようにモック
    (toggleCaptain as jest.Mock).mockResolvedValue({
      id: '1',
      tournamentId: '1',
      participantId: 'participant1',
      isCaptain: true,
    });

    const { result } = renderHook(() => useCaptainManagement(mockTournament, mockOnCaptainUpdated));

    const participantId = 'participant1';

    // キャプテントグル関数を実行
    await act(async () => {
      await result.current.handleCaptainToggle(participantId);
    });

    // 検証
    expect(toggleCaptain).toHaveBeenCalledWith('1', participantId);
    expect(mockOnCaptainUpdated).toHaveBeenCalledWith(true);

    // 処理完了後は処理中状態がリセットされていること
    expect(result.current.isProcessing).toBeNull();
  });

  it('処理中は参加者IDが設定されること', async () => {
    // 意図的に遅延するモックを設定
    (toggleCaptain as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    );

    const { result } = renderHook(() => useCaptainManagement(mockTournament, mockOnCaptainUpdated));

    const participantId = 'participant1';

    // キャプテントグル関数を実行
    let togglePromise: Promise<void>;
    act(() => {
      togglePromise = result.current.handleCaptainToggle(participantId);
    });

    // 処理中状態の検証
    expect(result.current.isProcessing).toBe(participantId);

    // 処理完了を待機
    await act(async () => {
      await togglePromise;
    });

    // 処理完了後は処理中状態がリセットされていること
    expect(result.current.isProcessing).toBeNull();
  });

  it('エラー発生時も処理完了後に処理中状態がリセットされること', async () => {
    // エラーを投げるモック
    const testError = new Error('API Error');
    (toggleCaptain as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => useCaptainManagement(mockTournament, mockOnCaptainUpdated));

    const participantId = 'participant1';

    // コンソールエラーをモック（テスト出力をクリーンに保つため）
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // キャプテントグル関数を実行
    await act(async () => {
      await result.current.handleCaptainToggle(participantId);
    });

    // コンソールエラーが呼ばれたことを検証
    expect(console.error).toHaveBeenCalledWith('主将設定エラー:', testError);

    // 元のコンソールエラー関数を復元
    console.error = originalConsoleError;

    // エラー発生時も処理完了後は処理中状態がリセットされていること
    expect(result.current.isProcessing).toBeNull();
  });

  it('同じ参加者に対する連続クリックを防止すること', async () => {
    // 意図的に遅延するモックを設定
    (toggleCaptain as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    );

    const { result } = renderHook(() => useCaptainManagement(mockTournament, mockOnCaptainUpdated));

    const participantId = 'participant1';

    // 1回目のトグル関数を実行
    let firstTogglePromise: Promise<void>;
    act(() => {
      firstTogglePromise = result.current.handleCaptainToggle(participantId);
    });

    // 処理中状態の検証
    expect(result.current.isProcessing).toBe(participantId);

    // 2回目のトグル関数を実行（処理中なので実行されないはず）
    act(() => {
      result.current.handleCaptainToggle(participantId);
    });

    // toggleCaptainが1回だけ呼ばれたことを検証
    expect(toggleCaptain).toHaveBeenCalledTimes(1);

    // 処理完了を待機
    await act(async () => {
      await firstTogglePromise;
    });
  });

  it('tournamentがnullの場合は処理が実行されないこと', async () => {
    const { result } = renderHook(() => useCaptainManagement(null, mockOnCaptainUpdated));

    await act(async () => {
      await result.current.handleCaptainToggle('participant1');
    });

    // APIが呼ばれていないことを検証
    expect(toggleCaptain).not.toHaveBeenCalled();
    expect(mockOnCaptainUpdated).not.toHaveBeenCalled();
    expect(result.current.isProcessing).toBeNull();
  });
});
