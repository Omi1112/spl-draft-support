import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

// GraphQL APIをNext.jsのAPIルートとして構成
const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: {
    Request: Request,
    Response: Response,
  },
});

// Next.js App Router用のハンドラー
export { handleRequest as GET, handleRequest as POST };
