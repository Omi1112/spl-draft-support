// 技術的負債の解消タスク
// コード重複・肥大化の解消、共通化・分割・リファクタリングを実施する
// 例: urqlクライアント生成の共通化
import { cacheExchange, fetchExchange, createClient, Client } from 'urql';

export const urqlClient: Client = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-first',
});

// 各APIクライアントで urqlClient をimportして利用するように修正する
