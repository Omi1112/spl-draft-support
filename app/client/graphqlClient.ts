// urqlのGraphQLクライアント共通定義
import { createClient, cacheExchange, fetchExchange, mapExchange } from 'urql';

// GraphQLエンドポイント
export const graphqlClient = createClient({
  url: '/api/graphql',
  requestPolicy: 'cache-and-network',
  exchanges: [
    cacheExchange,
    mapExchange({
      onError(error) {
        console.error(error);
      },
    }),
    fetchExchange,
  ],
});
