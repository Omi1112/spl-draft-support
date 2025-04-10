import { renderHook, waitFor } from '@testing-library/react';
import { useHome } from '../../app/hooks/useHome';
import * as tournamentsModule from '../../app/client/tournamentClient';
// tournamentsモジュール全体をモックします
jest.mock('../../app/client/tournamentClient', () => ({
  __esModule: true,
  fetchTournaments: jest.fn(),
}));

describe('useHome', () => {
  beforeEach(() => {
    // fetchTournamentsのモックをリセット
    jest.clearAllMocks();
  });

  it('初期状態ではローディング状態になること', async () => {
    // モックが呼び出されても解決しないようにする
    (tournamentsModule.fetchTournaments as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useHome());

    // 初期状態ではローディング状態
    expect(result.current.loading).toBe(true);
    expect(result.current.tournaments).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('大会一覧を取得できること', async () => {
    // モックデータ
    const mockTournaments = [
      { id: '1', name: 'テスト大会1', createdAt: '2025-04-07T00:00:00.000Z' },
      { id: '2', name: 'テスト大会2', createdAt: '2025-04-06T00:00:00.000Z' },
    ];

    // fetchTournamentsのモック
    (tournamentsModule.fetchTournaments as jest.Mock).mockResolvedValue(mockTournaments);

    const { result } = renderHook(() => useHome());

    // データ取得完了を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // 取得した大会データが設定されていることを確認
    await waitFor(() => {
      expect(result.current.tournaments).toEqual(mockTournaments);
      expect(result.current.error).toBeNull();
    });
  });

  it('大会が存在しない場合、空の配列が設定されること', async () => {
    // 空の大会リストをモック
    (tournamentsModule.fetchTournaments as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useHome());

    // データ取得完了を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // 空の配列が設定されていることを確認
    await waitFor(() => {
      expect(result.current.tournaments).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  it('エラー発生時にエラー状態が設定されること', async () => {
    // エラーをモック
    (tournamentsModule.fetchTournaments as jest.Mock).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useHome());

    // エラー状態が設定されるまで待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // エラーメッセージが設定されていることを確認
    await waitFor(() => {
      expect(result.current.error).toBe('大会一覧の取得に失敗しました');
      expect(result.current.tournaments).toEqual([]);
    });
  });
});
