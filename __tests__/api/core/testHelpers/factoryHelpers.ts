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
  participants?: Participant[];
  teams?: Team[];
  draftStatus?: DraftStatus;
}): Tournament {
  const id = new TournamentId(props.id || `tournament-${Date.now()}`);
  const name = props.name || 'テストトーナメント';
  const createdAt = props.createdAt || new Date();
  const participants = props.participants || [];
  const teams = props.teams || [];
  const draftStatus = props.draftStatus;

  return new Tournament(id, name, createdAt, participants, teams, draftStatus);
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
  team?: Team;
}): Participant {
  const id = new ParticipantId(props.id || `participant-${Date.now()}`);
  const name = props.name || 'テスト参加者';
  const weapon = props.weapon || 'テスト武器';
  const xp = props.xp !== undefined ? props.xp : 0;
  const createdAt = props.createdAt || new Date();
  const isCaptain = props.isCaptain !== undefined ? props.isCaptain : false;
  const team = props.team;

  return new Participant(id, name, weapon, xp, createdAt, isCaptain, team);
}

/**
 * テスト用のチームエンティティを作成する
 */
export function createTestTeam(props: {
  id?: string;
  name?: string;
  captainId: string | ParticipantId;
  memberIds?: Array<string | ParticipantId>;
}): Team {
  const id = new TeamId(props.id || `team-${Date.now()}`);
  const name = props.name || 'テストチーム';

  // captainIdがstring型の場合、ParticipantIdに変換
  const captainId =
    props.captainId instanceof ParticipantId ? props.captainId : new ParticipantId(props.captainId);

  // memberIdsが提供されていれば変換、なければ空配列
  const memberIds = (props.memberIds || []).map((memberId) =>
    memberId instanceof ParticipantId ? memberId : new ParticipantId(memberId)
  );

  return new Team(id, name, captainId, memberIds);
}

/**
 * テスト用のドラフトステータス値オブジェクトを作成する
 */
export function createTestDraftStatus(
  status: 'not_started' | 'in_progress' | 'completed' = 'not_started',
  round: number = 1,
  turn: number = 1
): DraftStatus {
  return new DraftStatus(round, turn, status);
}

/**
 * テスト用のドラフトエンティティを作成する
 */
export function createTestDraft(props: {
  id?: string;
  tournamentId: string | TournamentId;
  captainId: string | ParticipantId;
  participantId: string | ParticipantId;
  round?: number;
  turn?: number;
  status?: string;
  createdAt?: Date;
}): Draft {
  const id = new DraftId(props.id || `draft-${Date.now()}`);

  // 文字列の場合は適切な型に変換
  const tournamentId =
    props.tournamentId instanceof TournamentId
      ? props.tournamentId
      : new TournamentId(props.tournamentId);

  const captainId =
    props.captainId instanceof ParticipantId ? props.captainId : new ParticipantId(props.captainId);

  const participantId =
    props.participantId instanceof ParticipantId
      ? props.participantId
      : new ParticipantId(props.participantId);

  const round = props.round || 1;
  const turn = props.turn || 1;
  const status = props.status || 'drafted';
  const createdAt = props.createdAt || new Date();

  return new Draft(id, tournamentId, captainId, participantId, round, turn, status, createdAt);
}
