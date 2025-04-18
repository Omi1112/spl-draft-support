// 参加者追加APIクライアント
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

// 追加用入力型
export type AddParticipantInput = {
  tournamentId: string;
  participant: {
    name: string;
    weapon: string;
    xp: number;
    isCaptain?: boolean;
  };
};

// ミューテーション定義
const ADD_PARTICIPANT_TO_TOURNAMENT_MUTATION = gql`
  mutation AddParticipantToTournament($input: AddParticipantToTournamentInput!) {
    addParticipantToTournament(input: $input) {
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

// 参加者追加関数
export async function addParticipantToTournament(
  input: AddParticipantInput
): Promise<TournamentParticipant> {
  if (
    !input.tournamentId ||
    !input.participant?.name ||
    !input.participant.weapon ||
    input.participant.xp == null
  ) {
    throw new Error('必須項目が不足しています');
  }
  const result = await client
    .mutation(ADD_PARTICIPANT_TO_TOURNAMENT_MUTATION, { input })
    .toPromise();
  if (result.error) throw result.error;
  if (!result.data?.addParticipantToTournament) throw new Error('追加結果が取得できません');
  return result.data.addParticipantToTournament as TournamentParticipant;
}
