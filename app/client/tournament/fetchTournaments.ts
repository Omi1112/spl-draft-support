// GraphQLを使用して大会一覧を取得する関数
import { graphqlClient } from './graphqlClient';

// Tournament型定義
export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
}

// GraphQLクエリ
const TOURNAMENTS_QUERY = `
  query GetTournaments {
    tournaments {
      id
      name
      createdAt
    }
  }
`;

/**
 * 大会一覧を取得する関数
 * @returns Promise<Tournament[]> 大会一覧の配列
 */
export async function fetchTournaments(): Promise<Tournament[]> {
  try {
    const result = await graphqlClient.query(TOURNAMENTS_QUERY, {}).toPromise();

    if (result.error) {
      console.error('大会一覧の取得に失敗しました:', result.error);
      throw new Error(`大会一覧の取得に失敗しました: ${result.error.message}`);
    }

    return result.data?.tournaments || [];
  } catch (error) {
    console.error('大会一覧の取得中にエラーが発生しました:', error);
    throw error;
  }
}
