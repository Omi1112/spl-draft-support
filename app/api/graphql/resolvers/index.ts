// メインのリゾルバーファイル - 他のリゾルバファイルを統合します
import { tournamentResolvers } from './tournamentResolvers';

// リゾルバーの結合
export const resolvers = {
  Query: {
    ...tournamentResolvers.Query,
  },
  Mutation: {
    ...tournamentResolvers.Mutation,
  },
};
