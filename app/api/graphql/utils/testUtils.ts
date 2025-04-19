// filepath: /workspace/app/api/graphql/utils/testUtils.ts
import { createSchema } from 'graphql-yoga';
import { resolvers } from '../resolvers';
import { typeDefs } from '../types';
import { executeOperation } from 'graphql-yoga';
import { DocumentNode } from 'graphql';

/**
 * テスト用のGraphQLスキーマを作成する
 */
export const createTestSchema = () => {
  return createSchema({
    typeDefs,
    resolvers,
  });
};

/**
 * GraphQLクエリを実行するユーティリティ関数
 * @param query GraphQL操作（クエリまたはミューテーション）
 * @param variables 変数（オプション）
 * @param context コンテキスト（オプション）
 * @returns 実行結果
 */
export const executeGraphQL = async <T = any>(
  query: DocumentNode,
  variables?: Record<string, any>,
  context?: Record<string, any>
) => {
  const schema = createTestSchema();
  const result = await executeOperation(
    { schema },
    {
      query,
      variables: variables || {},
    },
    context || {}
  );

  return result as { data: T; errors?: any[] };
};
