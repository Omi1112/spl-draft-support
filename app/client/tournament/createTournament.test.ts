// createTournamentのテスト
import { graphqlClient } from '../graphqlClient';

import { createTournament } from './createTournament';

// グラフQLクライアントをモック化
jest.mock('./graphqlClient', () => ({
  graphqlClient: {
    mutation: jest.fn(),
  },
}));

describe('createTournament', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常に大会を作成できる', async () => {
    // 作成される大会のモックデータ
    const mockCreatedTournament = {
      id: '1',
      name: 'テスト大会',
      createdAt: '2025-04-18T10:00:00Z',
    };

    // GraphQLクライアントのmutationメソッドをモック
    (graphqlClient.mutation as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        data: { createTournament: mockCreatedTournament },
        error: undefined,
      }),
    });

    // 関数を実行
    const result = await createTournament({ name: 'テスト大会' });

    // 結果を検証
    expect(result).toEqual(mockCreatedTournament);
    expect(graphqlClient.mutation).toHaveBeenCalledWith(
      expect.stringContaining('mutation CreateTournament'),
      { input: { name: 'テスト大会' } }
    );
  });

  it('大会名が空の場合、エラーをスローする', async () => {
    // 空の大会名でテスト
    await expect(createTournament({ name: '' })).rejects.toThrow('大会名は必須です');
    expect(graphqlClient.mutation).not.toHaveBeenCalled();
  });

  it('大会名が空白のみの場合、エラーをスローする', async () => {
    // 空白のみの大会名でテスト
    await expect(createTournament({ name: '   ' })).rejects.toThrow('大会名は必須です');
    expect(graphqlClient.mutation).not.toHaveBeenCalled();
  });

  it('GraphQLエラー時にエラーをスローする', async () => {
    // エラーを返すモック
    (graphqlClient.mutation as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        data: undefined,
        error: { message: 'GraphQLエラー' },
      }),
    });

    // エラーがスローされることを検証
    await expect(createTournament({ name: 'テスト大会' })).rejects.toThrow(
      '大会作成に失敗しました: GraphQLエラー'
    );
    expect(graphqlClient.mutation).toHaveBeenCalled();
  });

  it('ネットワークエラー時にエラーをスローする', async () => {
    // ネットワークエラーをシミュレート
    const networkError = new Error('ネットワークエラー');
    (graphqlClient.mutation as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockRejectedValue(networkError),
    });

    // エラーがスローされることを検証
    await expect(createTournament({ name: 'テスト大会' })).rejects.toThrow('ネットワークエラー');
    expect(graphqlClient.mutation).toHaveBeenCalled();
  });

  it('大会名の前後の空白を削除する', async () => {
    // 作成される大会のモックデータ
    const mockCreatedTournament = {
      id: '1',
      name: '大会名',
      createdAt: '2025-04-18T10:00:00Z',
    };

    // GraphQLクライアントのmutationメソッドをモック
    (graphqlClient.mutation as jest.Mock).mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        data: { createTournament: mockCreatedTournament },
        error: undefined,
      }),
    });

    // スペースを含む大会名で実行
    await createTournament({ name: '  大会名  ' });

    // 入力値が正しくトリムされていることを確認
    expect(graphqlClient.mutation).toHaveBeenCalledWith(expect.anything(), {
      input: { name: '大会名' },
    });
  });
});
