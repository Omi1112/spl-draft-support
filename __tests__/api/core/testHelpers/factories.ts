import { Tournament } from '../../../../app/api/core/domain/entities/Tournament';
import { Participant } from '../../../../app/api/core/domain/entities/Participant';
import { Team } from '../../../../app/api/core/domain/entities/Team';
import { Draft } from '../../../../app/api/core/domain/entities/Draft';
import { DraftStatus } from '../../../../app/api/core/domain/valueObjects/DraftStatus';
import { TournamentId } from '../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '../../../../app/api/core/domain/valueObjects/TeamId';
import { DraftId } from '../../../../app/api/core/domain/valueObjects/DraftId';

/**
 * テスト用のトーナメントを生成するファクトリ関数
 */
export function createTestTournament(params: {
  id?: string;
  name?: string;
  createdAt?: Date;
  participantIds?: ParticipantId[];
  teamIds?: TeamId[];
  draftStatus?: DraftStatus;
}): Tournament {
  const id = params.id || `tournament-${Date.now()}`;
  const name = params.name || 'テストトーナメント';
  const createdAt = params.createdAt || new Date();
  const participantIds = params.participantIds || [];
  const teamIds = params.teamIds || [];
  const draftStatus = params.draftStatus;

  return Tournament.reconstruct(
    id,
    name,
    createdAt,
    participantIds.map((p) => p.value),
    teamIds.map((t) => t.value),
    draftStatus
  );
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
  teamId?: TeamId;
}): Participant {
  const id = params.id || `participant-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const name = params.name || 'テスト参加者';
  const weapon = params.weapon || 'デフォルト武器';
  const xp = params.xp !== undefined ? params.xp : 0;
  const createdAt = params.createdAt || new Date();
  const isCaptain = params.isCaptain !== undefined ? params.isCaptain : false;
  const teamId = params.teamId;

  return Participant.reconstruct(id, name, weapon, xp, createdAt, isCaptain, teamId?.value);
}

/**
 * テスト用のチームを生成するファクトリ関数
 */
export function createTestTeam(params: {
  id?: string;
  name?: string;
  captainId: ParticipantId;
  memberIds?: ParticipantId[];
}): Team {
  const id = params.id || `team-${Date.now()}`;
  const name = params.name || 'テストチーム';
  const captainId = params.captainId;
  const memberIds = params.memberIds || [captainId];

  return Team.reconstruct(
    id,
    name,
    captainId.value,
    memberIds.map((m) => m.value)
  );
}

/**
 * テスト用のドラフトを生成するファクトリ関数
 */
export function createTestDraft(params: {
  id?: string;
  tournamentId: TournamentId;
  captainId: ParticipantId;
  participantId: ParticipantId;
  round?: number;
  turn?: number;
  createdAt?: Date;
}): Draft {
  const id = params.id || `draft-${Date.now()}`;
  const tournamentId = params.tournamentId;
  const captainId = params.captainId;
  const participantId = params.participantId;
  const round = params.round || 1;
  const turn = params.turn || 1;
  const createdAt = params.createdAt || new Date();

  return Draft.reconstruct(
    id,
    tournamentId.value,
    captainId.value,
    participantId.value,
    round,
    turn,
    createdAt,
    createdAt // updatedAtをcreatedAtと同じ値で渡す
  );
}
