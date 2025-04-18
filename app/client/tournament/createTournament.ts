// トーナメント作成APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

// GraphQLスキーマを参考に型定義（例）
export type Tournament = {
  id: string;
  name: string;
  createdAt: string;
};

// CreateTournamentInput型を利用
export type CreateTournamentInput = {
  name: string;
};

// ミューテーション定義（input型を利用）
const CREATE_TOURNAMENT_MUTATION = gql`
  mutation CreateTournament($input: CreateTournamentInput!) {
    createTournament(input: $input) {
      id
      name
      createdAt
    }
  }
`;

// urqlクライアント生成
const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'network-only',
});

// トーナメント作成関数（input型を利用）
export async function createTournament(input: CreateTournamentInput): Promise<Tournament> {
  if (!input?.name) throw new Error('トーナメント名は必須です');
  const result = await client.mutation(CREATE_TOURNAMENT_MUTATION, { input }).toPromise();
  if (result.error) throw result.error;
  if (!result.data?.createTournament) throw new Error('作成結果が取得できません');
  return result.data.createTournament as Tournament;
}
