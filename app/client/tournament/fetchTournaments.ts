// /workspace/app/client/tournament/fetchTournaments.ts
import { gql } from 'urql'; // urql から gql をインポート

import { graphqlClient } from '../graphqlClient'; // 作成したクライアントを取得する関数をインポート

import { Tournament } from './types';

// GraphQLエンドポイントの相対パス
// const relativeEndpoint = '/api/graphql'; // urqlClient で定義するため不要

// GraphQLクエリの定義 (変更なし)
const GET_TOURNAMENTS_QUERY = gql`
  query GetTournaments {
    tournaments {
      id
      name
      createdAt
    }
  }
`;

/**
 * 大会一覧を取得するクライアント関数 (urql 版)
 * @returns 大会データの配列
 * @throws データ取得に失敗した場合にエラーをスロー
 */
export const fetchTournaments = async (): Promise<Tournament[]> => {
  try {
    // urql クライアントを使用してクエリを実行
    const result = await graphqlClient
      .query<{ tournaments: Tournament[] }>(GET_TOURNAMENTS_QUERY, {})
      .toPromise();

    if (result.error) {
      // urql のエラーハンドリング
      console.error('Error fetching tournaments with urql:', result.error);
      throw new Error(`Failed to fetch tournaments: ${result.error.message}`);
    }

    if (!result.data) {
      // データがない場合のエラーハンドリング
      console.error('No data returned from fetchTournaments query');
      throw new Error('Failed to fetch tournaments: No data received');
    }

    // 取得した大会データを返す
    return result.data.tournaments;
  } catch (error) {
    // その他の予期せぬエラー
    console.error('Unexpected error fetching tournaments:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error fetching tournaments';
    throw new Error(`Failed to fetch tournaments: ${errorMessage}`);
  }
};
