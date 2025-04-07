import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs as schemasTypeDefs } from "./schemas";
import { resolvers as tournamentResolvers } from "./resolvers/tournament";

// すべてのスキーマタイプ定義を結合
const typeDefs = [schemasTypeDefs];

// すべてのリゾルバーをマージ（現在はtournamentのみ）
const resolvers = {
  ...tournamentResolvers,
};

// スキーマを作成
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
