import { createYoga } from 'graphql-yoga';
import { NextRequest } from 'next/server';

import { schema } from './schema';

// GraphQL APIをNext.jsのAPIルートとして構成
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: {
    Request: Request,
    Response: Response,
  },
});

// Next.js App Router用のハンドラー
export async function GET(request: NextRequest) {
  return yoga.fetch(request);
}

export async function POST(request: NextRequest) {
  return yoga.fetch(request);
}
