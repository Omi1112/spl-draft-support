// filepath: /workspace/app/api/graphql/resolvers/tournament.ts
// メインのリゾルバーファイル - 他のリゾルバファイルを統合します
import { tournamentResolvers } from "./tournament/tournamentResolvers";
import { participantResolvers } from "./tournament/participantResolvers";
import { teamResolvers } from "./tournament/teamResolvers";
import { draftResolvers } from "./tournament/draftResolvers";

// すべてのリゾルバを統合
export const resolvers = {
  Query: {
    ...tournamentResolvers.Query,
    ...participantResolvers.Query,
    ...teamResolvers.Query,
    ...draftResolvers.Query,
  },
  Mutation: {
    ...tournamentResolvers.Mutation,
    ...participantResolvers.Mutation,
    ...teamResolvers.Mutation,
    ...draftResolvers.Mutation,
  },
  Tournament: tournamentResolvers.Tournament,
  Participant: participantResolvers.Participant,
  Team: teamResolvers.Team,
};
