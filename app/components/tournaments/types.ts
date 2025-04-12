// filepath: /workspace/app/components/tournaments/types.ts
// 型定義

// 大会データの型定義
export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  tournamentParticipants: TournamentParticipantWithParticipant[];
  captains?: Participant[];
  captain?: Participant;
  teams?: Team[];
  drafts?: Draft[];
  draftStatus?: DraftStatus;
}

// 参加者データの型定義
export interface Participant {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: string;
  isCaptain?: boolean;
  team?: Team;
}

// チームデータの型定義
export interface Team {
  id: string;
  name: string;
  captainId: string;
  captain: Participant;
  members: Participant[];
  tournamentId: string;
  createdAt: string;
}

// 参加登録データの型定義
export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  participantId: string;
  createdAt: string;
  isCaptain: boolean;
  teamId?: string;
}

// GraphQLスキーマに合わせたトーナメント参加者データ型定義
export interface TournamentParticipantWithParticipant {
  Tournament: Tournament;
  Participant: Participant;
  isCaptain: boolean;
  createdAt: string;
}

// ドラフト指名データの型定義
export interface Draft {
  id: string;
  tournamentId: string;
  captainId: string;
  participantId: string;
  createdAt: string;
  status: string;
  round: number;
  turn: number;
  captain: Participant;
  participant: Participant;
}

// ドラフトステータスの型定義
export interface DraftStatus {
  id: string;
  tournamentId: string;
  round: number;
  turn: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 参加者フォームデータの型定義
export interface ParticipantFormData {
  name: string;
  weapon: string;
  xp: string;
}
