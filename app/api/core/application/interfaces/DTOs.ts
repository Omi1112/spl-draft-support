// トーナメント関連のDTOs
export interface TournamentDTO {
  id: string;
  name: string;
  createdAt: string;
  tournamentParticipants?: TournamentParticipantDTO[];
  teams?: TeamDTO[];
  draftStatus?: DraftStatusDTO;
}

export interface CreateTournamentDTO {
  name: string;
}

// 参加者関連のDTOs
export interface ParticipantDTO {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: string;
  isCaptain: boolean;
  teamId?: string;
}

export interface TournamentParticipantDTO {
  tournament: TournamentDTO;
  participant: ParticipantDTO;
  isCaptain: boolean;
  createdAt: string;
}

export interface CreateParticipantDTO {
  name: string;
  weapon: string;
  xp: number;
  isCaptain?: boolean;
  tournamentId: string;
}

// チーム関連のDTOs
export interface TeamDTO {
  id: string;
  name: string;
  captainId: string;
  memberIds: string[];
}

export interface CreateTeamDTO {
  name: string;
  captainId: string;
  tournamentId: string;
}

// ドラフト関連のDTOs
export interface DraftStatusDTO {
  round: number;
  turn: number;
  isActive: boolean;
}

export interface UpdateDraftStatusDTO {
  tournamentId: string;
  round: number;
  turn: number;
  isActive: boolean;
}
