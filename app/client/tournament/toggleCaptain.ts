// 参加者キャプテン化APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

// TournamentParticipant型定義（GraphQLスキーマ参照）
export type TournamentParticipant = {
  id: string;
  tournamentId: string;
  participantId: string;
  isCaptain: boolean;
  createdAt?: string;
  Participant?: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
    createdAt: string;
  };
};

// ミューテーション定義
const TOGGLE_CAPTAIN_MUTATION = gql`
  mutation ToggleCaptain($input: ToggleCaptainInput!) {
    toggleCaptain(input: $input) {
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
`;

// urqlクライアント生成
const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'network-only',
});

// 参加者キャプテン化関数
export async function toggleCaptain(input: {
  tournamentId: string;
  participantId: string;
}): Promise<TournamentParticipant> {
  if (!input.tournamentId || !input.participantId) {
    throw new Error('tournamentIdとparticipantIdは必須です');
  }
  const result = await client.mutation(TOGGLE_CAPTAIN_MUTATION, { input }).toPromise();
  if (result.error) throw result.error;
  if (!result.data?.toggleCaptain) throw new Error('キャプテン化結果が取得できません');
  return result.data.toggleCaptain as TournamentParticipant;
}
