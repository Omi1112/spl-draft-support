// app/client/tournament/fetchTournaments.ts
// 大会一覧取得用のGraphQLクエリとfetch関数
// urqlを利用
import { gql } from 'urql';
import { graphqlClient } from './graphqlClient';

// GraphQLエンドポイント
const TOURNAMENTS_QUERY = gql`
  query Tournaments {
    tournaments {
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

export type Tournament = {
  id: string;
  name: string;
  createdAt: string;
  participants: { id: string }[];
  teams: { id: string }[];
  draftStatus?: {
    round: number;
    turn: number;
    status: string;
  } | null;
};

export async function fetchTournaments(): Promise<Tournament[]> {
  const result = await graphqlClient.query(TOURNAMENTS_QUERY, {}).toPromise();
  if (result.error) throw result.error;
  return result.data?.tournaments ?? [];
}
