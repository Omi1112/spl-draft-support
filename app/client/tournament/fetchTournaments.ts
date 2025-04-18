// トーナメント一覧取得APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

import { Tournament } from '@/app/client/tournament/types';

// クエリ定義
const TOURNAMENTS_QUERY = gql`
  query Tournaments {
    tournaments {
      id
      name
      createdAt
    }
  }
`;

// urqlクライアント生成
const client: Client = createClient({
  url: '/api/graphql', // Next.js APIルートを想定
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-first',
});

// トーナメント一覧取得関数
export async function fetchTournaments(): Promise<Tournament[]> {
  const result = await client.query(TOURNAMENTS_QUERY, {}).toPromise();
  if (result.error) throw result.error;
  // null/undefined安全
  if (!result.data?.tournaments) return [];
  return result.data.tournaments as Tournament[];
}
