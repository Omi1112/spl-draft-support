// GraphQLを使用して新しい大会を作成する関数
import { Tournament } from './fetchTournaments';
import { graphqlClient } from './graphqlClient';

// 大会作成用の入力インターフェース
export interface CreateTournamentInput {
  name: string;
}

// 大会作成用のGraphQLミューテーション
const CREATE_TOURNAMENT_MUTATION = `
  mutation CreateTournament($input: CreateTournamentInput!) {
    createTournament(input: $input) {
      id
      name
      createdAt
    }
  }
`;

/**
 * 新しい大会を作成する関数
 * @param input 大会作成に必要な情報（名前など）
 * @returns Promise<Tournament> 作成された大会情報
 */
export async function createTournament(input: CreateTournamentInput): Promise<Tournament> {
  try {
    // バリデーション
    if (!input.name || input.name.trim() === '') {
      throw new Error('大会名は必須です');
    }

    // GraphQLミューテーションの実行
    const result = await graphqlClient
      .mutation(CREATE_TOURNAMENT_MUTATION, {
        input: {
          name: input.name.trim(),
        },
      })
      .toPromise();

    if (result.error) {
      console.error('大会作成に失敗しました:', result.error);
      throw new Error(`大会作成に失敗しました: ${result.error.message}`);
    }

    return result.data?.createTournament;
  } catch (error) {
    console.error('大会作成中にエラーが発生しました:', error);
    throw error;
  }
}
