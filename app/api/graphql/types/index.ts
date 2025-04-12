import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Tournament {
    id: ID!
    name: String!
    createdAt: String!
    tournamentParticipants: [TournamentParticipant!]
    teams: [Team!]
    draftStatus: DraftStatus
    captains: [Participant!]
    drafts: [Draft!]
  }

  type Participant {
    id: ID!
    name: String!
    weapon: String!
    xp: Int!
    createdAt: String!
    team: Team
  }

  type Team {
    id: ID!
    name: String!
    captainId: ID!
    captain: Participant
    members: [Participant!]!
    createdAt: String
  }

  type DraftStatus {
    round: Int!
    turn: Int!
    status: String!
  }

  type Draft {
    id: ID!
    tournamentId: ID!
    captainId: ID!
    participantId: ID!
    round: Int!
    turn: Int!
    status: String!
    createdAt: String!
    captain: Participant
    participant: Participant
  }

  type Query {
    tournaments: [Tournament!]!
    tournament(id: ID!): Tournament
    participants(tournamentId: ID!): [Participant!]!
    captains(tournamentId: ID!): [Participant!]!
    teams(tournamentId: ID!): [Team!]!
    allParticipants: [Participant!]!
    tournamentCaptain(tournamentId: ID!): Participant
    tournamentCaptains(tournamentId: ID!): [Participant!]!
    drafts(tournamentId: ID!, captainId: ID): [Draft!]!
  }

  input CreateTournamentInput {
    name: String!
  }

  input CreateParticipantInput {
    name: String!
    weapon: String!
    xp: Int!
    isCaptain: Boolean
    tournamentId: ID!
  }

  input CreateTeamInput {
    name: String!
    captainId: ID!
    tournamentId: ID!
  }

  input UpdateDraftStatusInput {
    tournamentId: ID!
    round: Int!
    turn: Int!
    status: String!
  }

  input ToggleCaptainInput {
    tournamentId: ID!
    participantId: ID!
  }

  # 新しい参加者入力タイプを追加
  input ParticipantInput {
    name: String!
    weapon: String!
    xp: Int!
    isCaptain: Boolean
  }

  # 新しいミューテーション入力タイプを追加
  input AddParticipantToTournamentInput {
    tournamentId: ID!
    participant: ParticipantInput!
  }

  # ドラフトリセット用の入力タイプを追加
  input ResetDraftInput {
    tournamentId: ID!
  }

  type TournamentParticipant {
    id: ID!
    tournamentId: ID!
    participantId: ID!
    Tournament: Tournament!
    Participant: Participant!
    isCaptain: Boolean!
    createdAt: String
  }

  type Mutation {
    createTournament(input: CreateTournamentInput!): Tournament!
    addParticipant(input: CreateParticipantInput!): Participant!
    createTeam(input: CreateTeamInput!): Team!
    updateDraftStatus(input: UpdateDraftStatusInput!): DraftStatus!
    toggleCaptain(input: ToggleCaptainInput!): TournamentParticipant!
    setCaptain(input: ToggleCaptainInput!): TournamentParticipant!
      @deprecated(reason: "Use toggleCaptain instead")
    # 新しいミューテーションを追加
    addParticipantToTournament(input: AddParticipantToTournamentInput!): TournamentParticipant!
    # ドラフトリセットミューテーションを追加
    resetDraft(input: ResetDraftInput!): Boolean!
  }
`;
