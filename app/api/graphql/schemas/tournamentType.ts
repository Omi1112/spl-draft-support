// Tournament型の定義

export const tournamentTypeDefs = /* GraphQL */ `
  type Tournament {
    id: ID!
    name: String!
    createdAt: String!
    participants: [Participant!]!
    captains: [Participant!]!
    captain: Participant
    teams: [Team!]
    drafts: [Draft!]
    draftStatus: DraftStatus
  }

  input CreateTournamentInput {
    name: String!
  }

  input StartDraftInput {
    tournamentId: ID!
  }

  input ResetDraftInput {
    tournamentId: ID!
  }
`;
