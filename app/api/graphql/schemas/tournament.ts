// Tournamentに関連するGraphQLスキーマ定義

export const typeDefs = /* GraphQL */ `
  type Tournament {
    id: ID!
    name: String!
    createdAt: String!
    participants: [Participant!]!
    captains: [Participant!]!
    captain: Participant
    teams: [Team!]
  }

  type Participant {
    id: ID!
    name: String!
    weapon: String!
    xp: Int!
    createdAt: String!
    tournaments: [Tournament!]!
    isCaptainOf: [Tournament!]!
    team: Team
    isCaptain: Boolean
  }

  type Team {
    id: ID!
    name: String!
    captainId: String!
    captain: Participant!
    members: [Participant!]!
    tournamentId: String!
    tournament: Tournament!
    createdAt: String!
  }

  type TournamentParticipant {
    id: ID!
    tournamentId: String!
    participantId: String!
    createdAt: String!
    isCaptain: Boolean!
    teamId: String
  }

  type Query {
    tournaments: [Tournament!]!
    tournament(id: ID!): Tournament
    participants(tournamentId: ID!): [Participant!]!
    allParticipants: [Participant!]!
    tournamentCaptains(tournamentId: ID!): [Participant!]!
    tournamentCaptain(tournamentId: ID!): Participant
    teams(tournamentId: ID!): [Team!]!
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

  input SetCaptainInput {
    tournamentId: ID!
    participantId: ID!
  }

  input StartDraftInput {
    tournamentId: ID!
  }

  input ResetDraftInput {
    tournamentId: ID!
  }

  type Mutation {
    createTournament(input: CreateTournamentInput!): Tournament!
    createParticipant(input: CreateParticipantInput!): Participant!
    addParticipantToTournament(
      input: AddParticipantToTournamentInput!
    ): TournamentParticipant!
    setCaptain(input: SetCaptainInput!): TournamentParticipant!
    startDraft(input: StartDraftInput!): [Team!]!
    resetDraft(input: ResetDraftInput!): Boolean!
  }
`;
