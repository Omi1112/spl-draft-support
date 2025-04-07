// Participant型の定義

export const participantTypeDefs = /* GraphQL */ `
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
    nominatedBy: [Draft!]
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
`;
