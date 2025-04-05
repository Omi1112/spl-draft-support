// Tournamentに関連するGraphQLスキーマ定義

export const typeDefs = /* GraphQL */ `
  type Tournament {
    id: ID!
    name: String!
    createdAt: String!
  }

  type Query {
    tournaments: [Tournament!]!
    tournament(id: ID!): Tournament
  }

  input CreateTournamentInput {
    name: String!
  }

  type Mutation {
    createTournament(input: CreateTournamentInput!): Tournament!
  }
`;
