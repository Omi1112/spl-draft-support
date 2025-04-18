// 指名可能なトーナメント参加者一覧取得APIクライアント（TournamentParticipant型利用）
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

import { TournamentParticipant } from './types';

type NominateTournamentParticipantsResult = {
  nominateTournamentParticipants: TournamentParticipant[];
};

const NOMINATABLE_TOURNAMENT_PARTICIPANTS_QUERY = gql`
  query NominatableTournamentParticipants($tournamentId: ID!) {
    nominatableTournamentParticipants(tournamentId: $tournamentId) {
      id
      tournamentId
      participantId
      createdAt
      isCaptain
      participant {
        id
        name
        weapon
        xp
        createdAt
      }
    }
  }
`;

const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-first',
});

export async function fetchNominatableTournamentParticipants(
  tournamentId: string
): Promise<TournamentParticipant[]> {
  if (!tournamentId) throw new Error('tournamentIdは必須です');
  const result = await client
    .query<NominateTournamentParticipantsResult>(NOMINATABLE_TOURNAMENT_PARTICIPANTS_QUERY, {
      tournamentId,
    })
    .toPromise();
  if (result.error) throw result.error;
  if (!result.data?.nominateTournamentParticipants) return [];
  return result.data.nominateTournamentParticipants;
}
