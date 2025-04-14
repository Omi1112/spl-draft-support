import { createSchema } from 'graphql-yoga';

import { resolvers } from './resolvers';
import { typeDefs } from './types';

// Schema-firstアプローチでスキーマを作成
export const schema = createSchema({
  typeDefs,
  resolvers,
});
