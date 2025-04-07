// キャプテン詳細ページで使用する型定義

// 大会データの型定義
export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  teams?: Team[];
  draftStatus?: {
    round: number;
    turn: number;
  };
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
  members?: Participant[];
}

// 指名データの型定義
export interface Draft {
  id: string;
  tournamentId: string;
  captainId: string;
  participantId: string;
  status: string;
  createdAt: string;
  captain?: {
    id: string;
    name: string;
  };
  participant?: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
  };
}

// GraphQLレスポンスの型定義
export interface TournamentDataResponse {
  tournament: Tournament;
  captain: Participant;
  participants: Participant[];
  drafts: Draft[];
  allDrafts: Draft[];
  draftStatus: Tournament["draftStatus"];
}

export interface ConfirmModalProps {
  isOpen: boolean;
  participant: Participant | null;
  isLoading: boolean;
  error: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export interface NominatedParticipantItem {
  draft: Draft;
  participant: Participant | null;
}