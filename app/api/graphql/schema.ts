import { createSchema } from 'graphql-yoga';
import { typeDefs } from './types';
import { resolvers } from './resolvers';

// Schema-firstアプローチでスキーマを作成
export const schema = createSchema({
  typeDefs,
  resolvers,
});
