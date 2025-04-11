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
 * テスト用のトーナメントエンティティを作成する
 */
export function createTestTournament(props: {
  id?: string;
  name?: string;
  createdAt?: Date;
  participantIds?: ParticipantId[];
  teamIds?: TeamId[];
  draftStatus?: DraftStatus;
}): Tournament {
  const idValue = props.id || `tournament-${Date.now()}`;
  const id = new TournamentId(idValue);
  const name = props.name || 'テストトーナメント';
  const createdAt = props.createdAt || new Date();
  const participantIds = props.participantIds || [];
  const teamIds = props.teamIds || [];
  const draftStatus = props.draftStatus;

  return Tournament.reconstruct(
    idValue,
    name,
    createdAt,
    participantIds.map((p) => p.value),
    teamIds.map((t) => t.value),
    draftStatus
  );
}

/**
 * テスト用のドラフトステータスを作成する
 */
export function createTestDraftStatus(props: {
  round?: number;
  turn?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}): DraftStatus {
  const round = props.round !== undefined ? props.round : 1;
  const turn = props.turn !== undefined ? props.turn : 1;
  const status = props.status || 'not_started';

  return {
    round,
    turn,
    status,
  };
}

/**
 * テスト用の参加者エンティティを作成する
 */
export function createTestParticipant(props: {
  id?: string;
  name?: string;
  weapon?: string;
  xp?: number;
  createdAt?: Date;
  isCaptain?: boolean;
  teamId?: TeamId;
}): Participant {
  const idValue = props.id || `participant-${Date.now()}`;
  const id = new ParticipantId(idValue);
  const name = props.name || 'テスト参加者';
  const weapon = props.weapon || 'テスト武器';
  const xp = props.xp !== undefined ? props.xp : 0;
  const createdAt = props.createdAt || new Date();
  const isCaptain = props.isCaptain !== undefined ? props.isCaptain : false;
  const teamId = props.teamId;

  return Participant.reconstruct(idValue, name, weapon, xp, createdAt, isCaptain, teamId?.value);
}

/**
 * テスト用のチームエンティティを作成する
 */
export function createTestTeam(props: {
  id?: string;
  name?: string;
  captainId: ParticipantId;
  memberIds?: ParticipantId[];
}): Team {
  const idValue = props.id || `team-${Date.now()}`;
  const id = new TeamId(idValue);
  const name = props.name || 'テストチーム';
  const captainId = props.captainId;
  // デフォルトではキャプテンをメンバーに含める
  const memberIds = props.memberIds || [captainId];

  return Team.reconstruct(
    idValue,
    name,
    captainId.value,
    memberIds.map((m) => m.value)
  );
}

/**
 * テスト用のドラフトエンティティを作成する
 */
export function createTestDraft(props: {
  id?: string;
  tournamentId: TournamentId;
  captainId: ParticipantId;
  participantId: ParticipantId;
  round?: number;
  turn?: number;
  createdAt?: Date;
}): Draft {
  const idValue = props.id || `draft-${Date.now()}`;
  const id = new DraftId(idValue);
  const tournamentId = props.tournamentId;
  const captainId = props.captainId;
  const participantId = props.participantId;
  const round = props.round || 1;
  const turn = props.turn || 1;
  const createdAt = props.createdAt || new Date();

  return Draft.reconstruct(
    idValue,
    tournamentId.value,
    captainId.value,
    participantId.value,
    round,
    turn,
    createdAt,
    createdAt // updatedAtをcreatedAtと同じ値で渡す
  );
}
