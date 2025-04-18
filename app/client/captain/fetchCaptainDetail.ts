// キャプテン詳細取得APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

import { TournamentParticipant } from './types';

// クエリ定義
// captainQueryのレスポンス型
// strictな型チェック・null/undefined安全・日本語コメント

type CaptainDetailQueryResult = {
  captain: TournamentParticipant | null;
};

const CAPTAIN_DETAIL_QUERY = gql`
  query CaptainDetail($tournamentId: ID!, $participantId: ID!) {
    captain(tournamentId: $tournamentId, participantId: $participantId) {
      id
      tournamentId
      participantId
      isCaptain
      createdAt
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

// urqlクライアント生成
const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-first',
});

// キャプテン詳細取得関数
export async function fetchCaptainDetail(
  tournamentId: string,
  participantId: string
): Promise<TournamentParticipant | null> {
  if (!tournamentId || !participantId) throw new Error('tournamentId, participantIdは必須です');
  const result = await client
    .query<CaptainDetailQueryResult>(CAPTAIN_DETAIL_QUERY, { tournamentId, participantId })
    .toPromise();
  if (result.error) throw result.error;
  return result.data?.captain ?? null;
}
