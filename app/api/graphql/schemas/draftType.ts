// Draft関連の型定義

export const draftTypeDefs = /* GraphQL */ `
  type Draft {
    id: ID!
    tournamentId: String!
    captainId: String!
    participantId: String!
    createdAt: String!
    status: String!
    round: Int!
    turn: Int!
    captain: Participant!
    participant: Participant!
    tournament: Tournament!
  }

  type DraftStatus {
    id: ID!
    tournamentId: String!
    round: Int!
    turn: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    tournament: Tournament!
  }

  input NominateParticipantInput {
    tournamentId: ID!
    captainId: ID!
    participantId: ID!
  }

  input UpdateDraftStatusInput {
    draftId: ID!
    status: String!
  }

  input UpdateDraftRoundInput {
    tournamentId: ID!
    round: Int!
    turn: Int!
  }
`;
