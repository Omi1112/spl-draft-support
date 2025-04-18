import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Tournament {
    id: ID!
    name: String!
    createdAt: String!
    participants: [Participant!]
    teams: [Team!]
    draftStatus: DraftStatus
    drafts: [Draft!]
  }

  type Participant {
    id: ID!
    name: String!
    weapon: String!
    isCaptain: Boolean!
    xp: Int!
    createdAt: String!
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
    nominatableParticipants(tournamentId: ID!): [Participant!]!
    captain(tournamentId: ID!, participantId: ID!): Participant
    teams(tournamentId: ID!): [Team!]!
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

  # ドラフト開始用の入力タイプを追加
  input StartDraftInput {
    tournamentId: ID!
  }

  # 参加者指名用の入力タイプを追加
  input NominateParticipantInput {
    tournamentId: ID!
    captainId: ID!
    participantId: ID!
  }

  type Mutation {
    createTournament(input: CreateTournamentInput!): Tournament!
    addParticipant(input: CreateParticipantInput!): Participant!
    createTeam(input: CreateTeamInput!): Team!
    updateDraftStatus(input: UpdateDraftStatusInput!): DraftStatus!
    toggleCaptain(input: ToggleCaptainInput!): Participant!
    # 新しいミューテーションを追加
    addParticipantToTournament(input: AddParticipantToTournamentInput!): Participant!
    # ドラフトリセットミューテーションを追加
    resetDraft(input: ResetDraftInput!): Boolean!
    # ドラフト開始ミューテーションを追加
    startDraft(input: StartDraftInput!): Boolean!
    # 参加者指名ミューテーションを追加
    nominateParticipant(input: NominateParticipantInput!): Draft!
  }
`;
