// GraphQLスキーマ定義のエントリーポイント
import { tournamentTypeDefs } from "./tournamentType";
import { participantTypeDefs } from "./participantType";
import { teamTypeDefs } from "./teamType";
import { draftTypeDefs } from "./draftType";
import { queryTypeDefs } from "./queryType";
import { mutationTypeDefs } from "./mutationType";

// 全てのスキーマ定義を結合して提供
export const typeDefs = [
  tournamentTypeDefs,
  participantTypeDefs,
  teamTypeDefs,
  draftTypeDefs,
  queryTypeDefs,
  mutationTypeDefs,
].join("\n");
