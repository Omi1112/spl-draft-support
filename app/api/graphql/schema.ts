import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs as tournamentTypeDefs } from "./schemas/tournament";
import { resolvers as tournamentResolvers } from "./resolvers/tournament";

// すべてのスキーマタイプ定義を結合（現在はtournamentのみ）
const typeDefs = [tournamentTypeDefs];

// すべてのリゾルバーをマージ（現在はtournamentのみ）
const resolvers = {
  ...tournamentResolvers,
};

// スキーマを作成
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
