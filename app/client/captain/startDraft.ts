// ドラフト開始APIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

// ミューテーション定義
type StartDraftResult = {
  startDraft: boolean;
};

const START_DRAFT_MUTATION = gql`
  mutation StartDraft($input: StartDraftInput!) {
    startDraft(input: $input)
  }
`;

// urqlクライアント生成
const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'network-only',
});

// ドラフト開始関数
export async function startDraft(tournamentId: string): Promise<boolean> {
  if (!tournamentId) throw new Error('tournamentIdは必須です');
  const result = await client
    .mutation<StartDraftResult>(START_DRAFT_MUTATION, { input: { tournamentId } })
    .toPromise();
  if (result.error) throw result.error;
  return !!result.data?.startDraft;
}
