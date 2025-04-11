// メインのリゾルバーファイル - 他のリゾルバファイルを統合します
import { tournamentResolvers } from './tournamentResolvers';
import { participantResolvers } from './participantResolvers';
import { teamResolvers } from './teamResolvers';
import { draftResolvers } from './draftResolvers';

// リゾルバーの結合
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
  Team: teamResolvers.Team,
};
