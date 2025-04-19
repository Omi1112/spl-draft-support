import { gql } from 'graphql-tag';
import { tournamentTypeDefs } from './tournament';

// ベースとなるGraphQL型定義
const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// 全ての型定義を結合して提供する
export const typeDefs = [
  baseTypeDefs,
  tournamentTypeDefs,
  // 将来的に他のモジュールの型定義を追加する場合はここに追加
];
