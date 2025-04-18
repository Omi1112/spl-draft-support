// トーナメント詳細取得APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

// GraphQLスキーマを参考に型定義（例）
export type TournamentDetail = {
  id: string;
  name: string;
  createdAt: string;
  // 必要に応じて他のフィールドも追加
};

// クエリ定義
const TOURNAMENT_DETAIL_QUERY = gql`
  query Tournament($id: ID!) {
    tournament(id: $id) {
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
  requestPolicy: 'cache-first',
});

// トーナメント詳細取得関数
export async function fetchTournamentDetail(id: string): Promise<TournamentDetail | null> {
  if (!id) throw new Error('IDは必須です');
  const result = await client.query(TOURNAMENT_DETAIL_QUERY, { id }).toPromise();
  if (result.error) throw result.error;
  if (!result.data?.tournament) return null;
  return result.data.tournament as TournamentDetail;
}
