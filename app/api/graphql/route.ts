import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { NextRequest } from 'next/server';

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
