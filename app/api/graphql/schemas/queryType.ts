// Query型の定義

export const queryTypeDefs = /* GraphQL */ `
  type Query {
    tournaments: [Tournament!]!
    tournament(id: ID!): Tournament
    participants(tournamentId: ID!): [Participant!]!
    allParticipants: [Participant!]!
    tournamentCaptains(tournamentId: ID!): [Participant!]!
    tournamentCaptain(tournamentId: ID!): Participant
    teams(tournamentId: ID!): [Team!]!
    drafts(tournamentId: ID!, captainId: ID): [Draft!]!
    draftStatus(tournamentId: ID!): DraftStatus
  }
`;
