import { schema } from '../../../app/api/graphql/schema';
import { buildSchema, GraphQLObjectType } from 'graphql';
import { typeDefs } from '../../../app/api/graphql/types';
import { resolvers } from '../../../app/api/graphql/resolvers';

// リゾルバの型を文字列インデックスでアクセス可能にする型定義
type ResolversWithStringIndex = typeof resolvers & {
  [key: string]: any;
};

describe('GraphQLスキーマとリゾルバの整合性テスト', () => {
  const executableSchema = schema;

  test('スキーマのクエリとリゾルバのクエリが一致している', () => {
    // スキーマからクエリフィールド名を取得
    const queryType = executableSchema.getQueryType();
    expect(queryType).not.toBeNull();

    const schemaQueryFields = Object.keys(queryType?.getFields() || {});

    // リゾルバからクエリフィールド名を取得
    const resolverQueryFields = Object.keys(resolvers.Query);

    // 各スキーマクエリがリゾルバに実装されていることを確認
    for (const queryField of schemaQueryFields) {
      expect(resolverQueryFields).toContain(queryField);
    }

    // 各リゾルバクエリがスキーマに定義されていることを確認
    for (const resolverField of resolverQueryFields) {
      expect(schemaQueryFields).toContain(resolverField);
    }
  });

  test('スキーマのミューテーションとリゾルバのミューテーションが一致している', () => {
    // スキーマからミューテーションフィールド名を取得
    const mutationType = executableSchema.getMutationType();
    expect(mutationType).not.toBeNull();

    const schemaMutationFields = Object.keys(mutationType?.getFields() || {});

    // リゾルバからミューテーションフィールド名を取得
    const resolverMutationFields = Object.keys(resolvers.Mutation);

    // 各スキーマミューテーションがリゾルバに実装されていることを確認
    for (const mutationField of schemaMutationFields) {
      expect(resolverMutationFields).toContain(mutationField);
    }

    // 各リゾルバミューテーションがスキーマに定義されていることを確認
    for (const resolverField of resolverMutationFields) {
      expect(schemaMutationFields).toContain(resolverField);
    }
  });

  test('スキーマの型フィールドリゾルバがすべて実装されている', () => {
    // スキーマ内の型名を取得し、それぞれの型が適切にリゾルバで実装されているかを確認
    const typeMap = executableSchema.getTypeMap();

    // GraphQLの組み込み型を除外し、カスタム型だけをテスト
    const customTypes = Object.keys(typeMap).filter(
      (typeName) =>
        !typeName.startsWith('__') &&
        !['Query', 'Mutation', 'Boolean', 'String', 'ID', 'Int', 'Float'].includes(typeName)
    );

    // ObjectTypeのカスタム型だけを選択（InterfaceTypeやUnionTypeなどは除外）
    const objectTypes = customTypes.filter(
      (typeName) => typeMap[typeName] instanceof GraphQLObjectType
    );

    // リゾルバで型が実装されていることを確認
    for (const typeName of objectTypes) {
      // リゾルバを文字列インデックスでアクセス可能な型にキャスト
      const typedResolvers = resolvers as ResolversWithStringIndex;

      // スキーマ定義に対応する型があるかを確認 (Tournament, Participant, Teamなど)
      if (typedResolvers[typeName]) {
        const type = typeMap[typeName] as GraphQLObjectType;
        const typeFields = Object.keys(type.getFields());

        // 型のフィールドリゾルバがあるかを確認（すべてのフィールドにリゾルバが必要なわけではない）
        const resolverTypeFields = Object.keys(typedResolvers[typeName]);

        // リゾルバで実装されているフィールドがスキーマに定義されていることを確認
        for (const resolverField of resolverTypeFields) {
          expect(typeFields).toContain(resolverField);
        }
      }
    }
  });

  test('スキーマの文字列とリゾルバが整合している', () => {
    // リゾルバを文字列インデックスでアクセス可能な型にキャスト
    const typedResolvers = resolvers as ResolversWithStringIndex;

    // スキーマ文字列から直接ビルドしたスキーマで検証
    const schemaFromTypeDefs = buildSchema(typeDefs.loc?.source.body || '');

    // Query型のフィールドを取得
    const queryTypeFromTypeDefs = schemaFromTypeDefs.getQueryType();
    const queryFields = Object.keys(queryTypeFromTypeDefs?.getFields() || {});

    // Mutation型のフィールドを取得
    const mutationTypeFromTypeDefs = schemaFromTypeDefs.getMutationType();
    const mutationFields = Object.keys(mutationTypeFromTypeDefs?.getFields() || {});

    // リゾルバからフィールド名を取得
    const resolverQueryFields = Object.keys(typedResolvers.Query);
    const resolverMutationFields = Object.keys(typedResolvers.Mutation);

    // クエリの整合性確認
    for (const queryField of queryFields) {
      expect(resolverQueryFields).toContain(queryField);
    }

    // ミューテーションの整合性確認
    for (const mutationField of mutationFields) {
      expect(resolverMutationFields).toContain(mutationField);
    }
  });
});
