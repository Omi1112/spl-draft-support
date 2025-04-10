import { Tournament } from '../../../../app/api/core/domain/entities/Tournament';
import { Participant } from '../../../../app/api/core/domain/entities/Participant';
import { Team } from '../../../../app/api/core/domain/entities/Team';
import { Draft } from '../../../../app/api/core/domain/entities/Draft';
import { TournamentId } from '../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '../../../../app/api/core/domain/valueObjects/TeamId';
import { DraftId } from '../../../../app/api/core/domain/valueObjects/DraftId';
import { DraftStatus } from '../../../../app/api/core/domain/valueObjects/DraftStatus';

/**
 * テスト用のトーナメントを生成するファクトリ関数
 */
export function createTestTournament(params: {
  id?: string;
  name?: string;
  createdAt?: Date;
  participants?: Participant[];
  teams?: Team[];
  draftStatus?: DraftStatus;
}): Tournament {
  const id = params.id || `tournament-${Date.now()}`;
  const name = params.name || 'テストトーナメント';
  const createdAt = params.createdAt || new Date();
  const participants = params.participants || [];
  const teams = params.teams || [];
  const draftStatus = params.draftStatus;

  return new Tournament(new TournamentId(id), name, createdAt, participants, teams, draftStatus);
}

/**
 * テスト用の参加者を生成するファクトリ関数
 */
export function createTestParticipant(params: {
  id?: string;
  name?: string;
  weapon?: string;
  xp?: number;
  createdAt?: Date;
  isCaptain?: boolean;
  team?: Team;
}): Participant {
  const id = params.id || `participant-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const name = params.name || 'テスト参加者';
  const weapon = params.weapon || 'デフォルト武器';
  const xp = params.xp !== undefined ? params.xp : 0;
  const createdAt = params.createdAt || new Date();
  const isCaptain = params.isCaptain !== undefined ? params.isCaptain : false;
  const team = params.team;

  return new Participant(new ParticipantId(id), name, weapon, xp, createdAt, isCaptain, team);
}

/**
 * テスト用のチームを生成するファクトリ関数
 */
export function createTestTeam(params: {
  id?: string;
  name?: string;
  captainId: string;
  members?: string[];
}): Team {
  const id = params.id || `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const name = params.name || 'テストチーム';
  const members = params.members
    ? params.members.map((member) => new ParticipantId(member))
    : undefined;

  return new Team(new TeamId(id), name, new ParticipantId(params.captainId), members);
}

/**
 * テスト用のドラフトを生成するファクトリ関数
 */
export function createTestDraft(params: {
  id?: string;
  tournamentId: string;
  captainId: string;
  participantId: string;
  round?: number;
  turn?: number;
  status?: string;
  createdAt?: Date;
}): Draft {
  const id = params.id || `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const round = params.round !== undefined ? params.round : 1;
  const turn = params.turn !== undefined ? params.turn : 1;
  const status = params.status || 'pending';
  const createdAt = params.createdAt || new Date();

  return new Draft(
    new DraftId(id),
    new TournamentId(params.tournamentId),
    new ParticipantId(params.captainId),
    new ParticipantId(params.participantId),
    round,
    turn,
    status,
    createdAt
  );
}

/**
 * テスト用のドラフトステータスを生成する関数
 */
export function createTestDraftStatus(
  status: 'not_started' | 'in_progress' | 'completed',
  round: number = 1,
  turn: number = 1
): DraftStatus {
  return new DraftStatus(round, turn, status);
}
