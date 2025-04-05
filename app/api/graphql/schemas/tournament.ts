// Tournamentに関連するGraphQLスキーマ定義

export const typeDefs = /* GraphQL */ `
  type Tournament {
    id: ID!
    name: String!
    createdAt: String!
    participants: [Participant!]!
  }

  type Participant {
    id: ID!
    name: String!
    weapon: String!
    xp: Int!
    createdAt: String!
    tournaments: [Tournament!]!
  }

  type TournamentParticipant {
    id: ID!
    tournamentId: String!
    participantId: String!
    createdAt: String!
  }

  type Query {
    tournaments: [Tournament!]!
    tournament(id: ID!): Tournament
    participants(tournamentId: ID!): [Participant!]!
    allParticipants: [Participant!]!
  }

  input CreateTournamentInput {
    name: String!
  }

  input CreateParticipantInput {
    name: String!
    weapon: String!
    xp: Int!
  }

  input AddParticipantToTournamentInput {
    tournamentId: ID!
    participantId: ID
    participant: CreateParticipantInput
  }

  type Mutation {
    createTournament(input: CreateTournamentInput!): Tournament!
    createParticipant(input: CreateParticipantInput!): Participant!
    addParticipantToTournament(
      input: AddParticipantToTournamentInput!
    ): TournamentParticipant!
  }
`;
