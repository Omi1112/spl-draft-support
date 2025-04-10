import { TournamentWithCaptains } from '../types';

// GraphQLクエリを実行する関数
export async function fetchTournamentCaptains(
  tournamentId: string
): Promise<TournamentWithCaptains> {
  const query = `
    query GetTournamentCaptains($id: ID!) {
      tournament(id: $id) {
        id
        name
        createdAt
        participants(isCaptain: true) {
          id
          name
          weapon
          xp
          createdAt
        }
      }
    }
  `;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { id: tournamentId },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
  }

  return result.data.tournament;
}
