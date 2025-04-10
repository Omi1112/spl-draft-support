import { renderHook, act, waitFor } from '@testing-library/react';
import { useTournamentData } from '../../../../app/tournaments/[id]/hooks/useTournamentData';
import { fetchTournament } from '../../../../app/client/tournamentClient';
import { addCaptainFlagsToParticipants } from '../../../../app/tournaments/[id]/hooks/tournamentUtils';
import { Tournament, Participant } from '../../../../app/components/tournaments/types';

// 依存関数のモック
jest.mock('../../../../app/client/tournamentClient', () => ({
  fetchTournament: jest.fn(),
}));

jest.mock('../../../../app/tournaments/[id]/hooks/tournamentUtils', () => ({
  addCaptainFlagsToParticipants: jest.fn((data) => data), // デフォルトではデータをそのまま返すモック
}));

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// テスト全体のタイムアウト値を20秒に設定
jest.setTimeout(20000);

describe('useTournamentData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態ではローディング状態であること', () => {
    const { result } = renderHook(() => useTournamentData('1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.tournament).toBeNull();
    expect(result.current.error).toBeNull();
  }, 15000);

  it('トーナメントデータが正常に取得できた場合', async () => {
    // モックデータの設定
    const mockTournament: Tournament = {
      id: '1',
      name: 'テストトーナメント',
      createdAt: '2025-04-07T00:00:00.000Z',
      participants: [
        {
          id: 'p1',
          name: 'テスト参加者1',
          weapon: '剣',
          xp: 100,
          createdAt: '2025-04-07T00:00:00.000Z',
        },
        {
          id: 'p2',
          name: 'テスト参加者2',
          weapon: '槍',
          xp: 150,
          createdAt: '2025-04-07T00:00:00.000Z',
        },
      ],
    };

    (fetchTournament as jest.Mock).mockResolvedValue(mockTournament);
    (addCaptainFlagsToParticipants as jest.Mock).mockReturnValue({
      ...mockTournament,
      participants: [
        {
          id: 'p1',
          name: 'テスト参加者1',
          weapon: '剣',
          xp: 100,
          createdAt: '2025-04-07T00:00:00.000Z',
          isCaptain: true,
        },
        {
          id: 'p2',
          name: 'テスト参加者2',
          weapon: '槍',
          xp: 150,
          createdAt: '2025-04-07T00:00:00.000Z',
          isCaptain: false,
        },
      ],
    });

    // フックをレンダリング
    const { result } = renderHook(() => useTournamentData('1'));

    // 非同期処理が完了するまで待機
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 15000 }
    );

    // 期待される結果の検証
    expect(result.current.tournament).toEqual({
      id: '1',
      name: 'テストトーナメント',
      createdAt: '2025-04-07T00:00:00.000Z',
      participants: [
        {
          id: 'p1',
          name: 'テスト参加者1',
          weapon: '剣',
          xp: 100,
          createdAt: '2025-04-07T00:00:00.000Z',
          isCaptain: true,
        },
        {
          id: 'p2',
          name: 'テスト参加者2',
          weapon: '槍',
          xp: 150,
          createdAt: '2025-04-07T00:00:00.000Z',
          isCaptain: false,
        },
      ],
    });
    expect(result.current.error).toBeNull();

    // 関数が正しく呼ばれたことを検証
    expect(fetchTournament).toHaveBeenCalledWith('1');
    expect(addCaptainFlagsToParticipants).toHaveBeenCalledWith(mockTournament);
  }, 15000);

  it('トーナメントデータが存在しない場合にエラーが設定されること', async () => {
    // データが取得できない場合のモック
    (fetchTournament as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useTournamentData('1'));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 15000 }
    );

    expect(result.current.tournament).toBeNull();
    expect(result.current.error).toBe('大会が見つかりませんでした。');
  }, 15000);

  it('データ取得時にエラーが発生した場合', async () => {
    // エラーを投げるモック
    (fetchTournament as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useTournamentData('1'));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 15000 }
    );

    expect(result.current.tournament).toBeNull();
    expect(result.current.error).toBe('データの取得中にエラーが発生しました。');
  }, 15000);

  it('refreshTournament関数が正しく動作すること', async () => {
    // 初期データ
    const initialTournament: Tournament = {
      id: '1',
      name: '初期トーナメント',
      createdAt: '2025-04-07T00:00:00.000Z',
      participants: [],
    };

    // 更新後のデータ
    const updatedTournament: Tournament = {
      id: '1',
      name: '更新済みトーナメント',
      createdAt: '2025-04-07T00:00:00.000Z',
      participants: [
        {
          id: 'p1',
          name: '新しい参加者',
          weapon: '弓',
          xp: 200,
          createdAt: '2025-04-07T00:00:00.000Z',
        },
      ],
    };

    // 最初の読み込みでinitialTournament
    (fetchTournament as jest.Mock).mockResolvedValueOnce(initialTournament);

    (addCaptainFlagsToParticipants as jest.Mock).mockImplementation((data) => data); // データをそのまま返すシンプルなモック

    const { result } = renderHook(() => useTournamentData('1'));

    // 初期ロード完了を待機
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 15000 }
    );

    expect(result.current.tournament).toEqual(initialTournament);

    // refreshTournament関数を実行
    (fetchTournament as jest.Mock).mockResolvedValueOnce(updatedTournament);

    await result.current.refreshTournament();

    await waitFor(
      () => {
        expect(result.current.tournament).toEqual(updatedTournament);
      },
      { timeout: 15000 }
    );
  }, 15000);

  it('skipLoading=trueでrefreshTournament関数を呼び出した場合、ローディング状態を変更しないこと', async () => {
    const mockTournament: Tournament = {
      id: '1',
      name: 'テストトーナメント',
      createdAt: '2025-04-07T00:00:00.000Z',
      participants: [],
    };
    (fetchTournament as jest.Mock).mockResolvedValue(mockTournament);

    const { result } = renderHook(() => useTournamentData('1'));

    // 初期ロード完了を待機
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 15000 }
    );

    // 初期状態では非ローディング
    expect(result.current.loading).toBe(false);

    // skipLoading=trueでリフレッシュ
    await result.current.refreshTournament(true);

    await waitFor(
      () => {
        // ローディング状態が変わっていないことを確認
        expect(result.current.loading).toBe(false);
      },
      { timeout: 15000 }
    );
  }, 15000);
});
