// 参加者指名APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

// Draft型定義（GraphQLスキーマ参照）
export type Draft = {
  id: string;
  tournamentId: string;
  captainId: string;
  participantId: string;
  round: number;
  turn: number;
  status: string;
  createdAt: string;
};

// ミューテーション定義
const NOMINATE_PARTICIPANT_MUTATION = gql`
  mutation NominateParticipant($input: NominateParticipantInput!) {
    nominateParticipant(input: $input) {
      id
      tournamentId
      captainId
      participantId
      round
      turn
      status
      createdAt
    }
  }
`;

const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'network-only',
});

export async function nominateParticipant(input: {
  tournamentId: string;
  captainId: string;
  participantId: string;
}): Promise<Draft> {
  if (!input.tournamentId || !input.captainId || !input.participantId) {
    throw new Error('必須項目が不足しています');
  }
  const result = await client.mutation(NOMINATE_PARTICIPANT_MUTATION, { input }).toPromise();
  if (result.error) throw result.error;
  if (!result.data?.nominateParticipant) throw new Error('指名結果が取得できません');
  return result.data.nominateParticipant as Draft;
}
