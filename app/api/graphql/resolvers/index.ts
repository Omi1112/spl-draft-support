// メインのリゾルバーファイル - 他のリゾルバファイルを統合します
import { draftResolvers } from './draftResolvers';
import { participantResolvers } from './participantResolvers';
import { teamResolvers } from './teamResolvers';
import { tournamentResolvers } from './tournamentResolvers';

// リゾルバーの結合
export const resolvers = {
  Query: {
    ...tournamentResolvers.Query,
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
