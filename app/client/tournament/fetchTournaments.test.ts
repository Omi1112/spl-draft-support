// fetchTournamentsのテスト
import { graphqlClient } from '../graphqlClient';

import { fetchTournaments } from './fetchTournaments';

// グラフQLクライアントをモック化
jest.mock('./graphqlClient', () => ({
  graphqlClient: {
    query: jest.fn(),
  },
}));

describe('fetchTournaments', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常に大会一覧を取得できる', async () => {
    // モックの戻り値を設定
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

    // GraphQLクライアントのqueryメソッドをモック
    (graphqlClient.query as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        data: { tournaments: mockTournaments },
        error: undefined,
      }),
    });

    // 関数を実行
    const result = await fetchTournaments();

    // 結果を検証
    expect(result).toEqual(mockTournaments);
    expect(graphqlClient.query).toHaveBeenCalled();
  });

  it('空の大会リストを返す', async () => {
    // 空の大会リストを返すモック
    (graphqlClient.query as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        data: { tournaments: [] },
        error: undefined,
      }),
    });

    const result = await fetchTournaments();

    // 結果を検証
    expect(result).toEqual([]);
    expect(graphqlClient.query).toHaveBeenCalled();
  });

  it('GraphQLエラー時にエラーをスローする', async () => {
    // エラーを返すモック
    (graphqlClient.query as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        data: undefined,
        error: { message: 'GraphQLエラー' },
      }),
    });

    // エラーがスローされることを検証
    await expect(fetchTournaments()).rejects.toThrow('大会一覧の取得に失敗しました: GraphQLエラー');
    expect(graphqlClient.query).toHaveBeenCalled();
  });

  it('ネットワークエラー時にエラーをスローする', async () => {
    // ネットワークエラーをシミュレート
    const networkError = new Error('ネットワークエラー');
    (graphqlClient.query as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockRejectedValue(networkError),
    });

    // エラーがスローされることを検証
    await expect(fetchTournaments()).rejects.toThrow('ネットワークエラー');
    expect(graphqlClient.query).toHaveBeenCalled();
  });
});
