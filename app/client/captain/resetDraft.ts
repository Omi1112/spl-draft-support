// ドラフトリセットAPIクライアント
// strictな型チェック・null/undefined安全・日本語コメント
import { createClient, Client, gql, cacheExchange, fetchExchange } from 'urql';

type ResetDraftResult = {
  resetDraft: boolean;
};

const RESET_DRAFT_MUTATION = gql`
  mutation ResetDraft($input: ResetDraftInput!) {
    resetDraft(input: $input)
  }
`;

const client: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'network-only',
});

export async function resetDraft(tournamentId: string): Promise<boolean> {
  if (!tournamentId) throw new Error('tournamentIdは必須です');
  const result = await client
    .mutation<ResetDraftResult>(RESET_DRAFT_MUTATION, { input: { tournamentId } })
    .toPromise();
  if (result.error) throw result.error;
  return !!result.data?.resetDraft;
}
