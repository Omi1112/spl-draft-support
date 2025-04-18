// 参加者一覧取得APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

// TournamentParticipant型定義（GraphQLスキーマ参照）
export type TournamentParticipant = {
  id: string;
  tournamentId: string;
  participantId: string;
  isCaptain: boolean;
  createdAt?: string;
  // Participant型も必要に応じて拡張
  Participant?: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
    createdAt: string;
  };
};

// クエリ定義
type TournamentParticipantsQueryResult = {
  tournament: {
    tournamentParticipants: TournamentParticipant[];
  } | null;
};

const TOURNAMENT_PARTICIPANTS_QUERY = gql`
  query TournamentParticipants($tournamentId: ID!) {
    tournament(id: $tournamentId) {
      tournamentParticipants {
        id
        tournamentId
        participantId
        isCaptain
        createdAt
        Participant {
          id
          name
          weapon
          xp
          createdAt
        }
      }
    }
  }
`;

// urqlクライアント生成
const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-first',
});

// 参加者一覧取得関数
export async function fetchTournamentParticipants(
  tournamentId: string
): Promise<TournamentParticipant[]> {
  if (!tournamentId) throw new Error('tournamentIdは必須です');
  const result = await client
    .query<TournamentParticipantsQueryResult>(TOURNAMENT_PARTICIPANTS_QUERY, { tournamentId })
    .toPromise();
  if (result.error) throw result.error;
  if (!result.data?.tournament?.tournamentParticipants) return [];
  return result.data.tournament.tournamentParticipants;
}
