// 型定義
type Context = Record<string, unknown>;

export const tournamentResolvers = {
  Query: {
    // トーナメント一覧を取得
    tournaments: async () => {
      // モックデータでトーナメント一覧を返却
      return [
        {
          id: 'tournament-1',
          name: 'サンプルトーナメント1',
          createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        },
        {
          id: 'tournament-2',
          name: 'サンプルトーナメント2',
          createdAt: new Date('2024-02-01T10:00:00Z').toISOString(),
        },
      ];
    },
  },
  Mutation: {
    // 新しいトーナメントを作成
    createTournament: async (_: Context, { input }: { input: { name: string } }) => {
      return {
        id: 'tournament-1',
        name: 'サンプルトーナメント1',
        createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
      };
    },
  },
};
