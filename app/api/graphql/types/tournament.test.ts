// filepath: /workspace/app/api/graphql/types/tournament.test.ts
import { gql } from 'graphql-tag';
import { schema } from '../schema';
import { execute, ExecutionResult } from 'graphql';

// テスト用のクエリ文字列
const TEST_QUERY = gql`
  query {
    tournaments {
      id
      name
      createdAt
    }
  }
`;

describe('Tournament GraphQLスキーマ', () => {
  it('tournamentクエリが存在し、適切な型定義があること', async () => {
    // スキーマの型情報を取得するためのクエリ
    const introspectionQuery = gql`
      {
        __type(name: "Tournament") {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;

    const result = (await execute({
      schema,
      document: introspectionQuery,
    })) as ExecutionResult;

    // エラーがないことを確認
    expect(result.errors).toBeUndefined();

    // Tournament型が存在することを確認
    expect(result.data?.__type).toBeDefined();
    expect(result.data?.__type.name).toBe('Tournament');

    // 必須フィールドが存在することを確認
    const fields = result.data?.__type.fields;
    const fieldNames = fields.map((field: { name: string }) => field.name);

    expect(fieldNames).toContain('id');
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('createdAt');
    expect(fieldNames).toContain('participants');
    expect(fieldNames).toContain('teams');
    expect(fieldNames).toContain('draftStatus');
    expect(fieldNames).toContain('drafts');
  });

  it('リゾルバーが tournaments クエリを処理できること', async () => {
    // モックが設定されるため、ここでは結果の型だけを確認
    const result = (await execute({
      schema,
      document: TEST_QUERY,
    })) as ExecutionResult;

    // エラーがないことを確認
    expect(result.errors).toBeUndefined();
    // データの型が期待どおりであることを確認（実際の値はモックに依存）
    expect(result.data).toBeDefined();
    expect(result.data?.tournaments).toBeDefined();
  });
});
