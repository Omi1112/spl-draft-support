// Team型の定義

export const teamTypeDefs = /* GraphQL */ `
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
`;
