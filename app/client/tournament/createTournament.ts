// app/client/tournament/createTournament.ts
// 大会作成用のGraphQLミューテーションとfetch関数
// urqlを利用
import { gql } from 'urql';
import { graphqlClient } from './graphqlClient';

const CREATE_TOURNAMENT_MUTATION = gql`
  mutation CreateTournament($input: CreateTournamentInput!) {
    createTournament(input: $input) {
      id
      name
      createdAt
      participants {
        id
      }
      teams {
        id
      }
      draftStatus {
        round
        turn
        status
      }
    }
  }
`;

export type CreateTournamentInput = {
  name: string;
};

export async function createTournament(input: CreateTournamentInput) {
  const result = await graphqlClient.mutation(CREATE_TOURNAMENT_MUTATION, { input }).toPromise();
  if (result.error) throw result.error;
  return result.data?.createTournament;
}
