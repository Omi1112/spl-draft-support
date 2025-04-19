// filepath: /workspace/app/api/graphql/types/tournament.ts
import { gql } from 'graphql-tag';

/**
 * Tournamentに関連するGraphQL型定義
 * トーナメント、参加者、チーム、ドラフトなどの型を定義
 */
export const tournamentTypeDefs = gql`
  # トーナメント型定義
  type Tournament {
    id: ID!
    name: String!
    createdAt: String!
    participants: [Participant!]
    teams: [Team!]
    draftStatus: DraftStatus
    drafts: [Draft!]
  }

  # 参加者型定義
  type Participant {
    id: ID!
    name: String!
    weapon: String!
    isCaptain: Boolean!
    xp: Int!
    createdAt: String!
  }

  # チーム型定義
  type Team {
    id: ID!
    name: String!
    captainId: ID!
    captain: Participant
    members: [Participant!]!
    createdAt: String
  }

  # ドラフトステータス型定義
  type DraftStatus {
    round: Int!
    turn: Int!
    status: String!
  }

  # ドラフト型定義
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

  # トーナメント関連クエリ
  extend type Query {
    tournaments: [Tournament!]!
  }

  # トーナメント作成入力
  input CreateTournamentInput {
    name: String!
  }

  # 参加者作成入力
  input CreateParticipantInput {
    name: String!
    weapon: String!
    xp: Int!
    isCaptain: Boolean
    tournamentId: ID!
  }

  # チーム作成入力
  input CreateTeamInput {
    name: String!
    captainId: ID!
    tournamentId: ID!
  }

  # ドラフトステータス更新入力
  input UpdateDraftStatusInput {
    tournamentId: ID!
    round: Int!
    turn: Int!
    status: String!
  }

  # キャプテン切り替え入力
  input ToggleCaptainInput {
    tournamentId: ID!
    participantId: ID!
  }

  # 参加者入力
  input ParticipantInput {
    name: String!
    weapon: String!
    xp: Int!
    isCaptain: Boolean
  }

  # トーナメントへの参加者追加入力
  input AddParticipantToTournamentInput {
    tournamentId: ID!
    participant: ParticipantInput!
  }

  # ドラフトリセット入力
  input ResetDraftInput {
    tournamentId: ID!
  }

  # ドラフト開始入力
  input StartDraftInput {
    tournamentId: ID!
  }

  # 参加者指名入力
  input NominateParticipantInput {
    tournamentId: ID!
    captainId: ID!
    participantId: ID!
  }

  # トーナメント関連ミューテーション
  extend type Mutation {
    createTournament(input: CreateTournamentInput!): Tournament!
  }
`;
