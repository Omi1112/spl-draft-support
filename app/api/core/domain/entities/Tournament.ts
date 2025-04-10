import { Participant } from './Participant';
import { Team } from './Team';
import { DraftStatus } from '../valueObjects/DraftStatus';
import { TournamentId } from '../valueObjects/TournamentId';
import { ParticipantId } from '../valueObjects/ParticipantId';

export class Tournament {
  private readonly _id: TournamentId;
  private _name: string;
  private _createdAt: Date;
  private _participants: Participant[];
  private _teams: Team[];
  private _draftStatus?: DraftStatus;

  constructor(
    id: TournamentId,
    name: string,
    createdAt: Date,
    participants: Participant[] = [],
    teams: Team[] = [],
    draftStatus?: DraftStatus
  ) {
    this._id = id;
    this._name = name;
    this._createdAt = createdAt;
    this._participants = participants;
    this._teams = teams;
    this._draftStatus = draftStatus;
  }

  // Getters
  get id(): TournamentId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get participants(): Participant[] {
    return [...this._participants];
  }

  get teams(): Team[] {
    return [...this._teams];
  }

  get draftStatus(): DraftStatus | undefined {
    return this._draftStatus;
  }

  // Methods
  addParticipant(participant: Participant): void {
    // 重複チェック
    const existingParticipant = this._participants.find((p) => p.id.value === participant.id.value);

    if (existingParticipant) {
      throw new Error(`参加者ID ${participant.id.value} はすでに登録されています`);
    }

    this._participants.push(participant);
  }

  removeParticipant(participantId: string): void {
    // チームのメンバーとして参加している場合はエラー
    const isTeamMember = this._teams.some((team) =>
      team.memberIds.some((memberId) => memberId.value === participantId)
    );

    if (isTeamMember) {
      throw new Error('このユーザーはチームに所属しているため削除できません');
    }

    this._participants = this._participants.filter((p) => p.id.value !== participantId);
  }

  addTeam(team: Team): void {
    // 重複チェック
    const existingTeam = this._teams.find((t) => t.id.value === team.id.value);

    if (existingTeam) {
      throw new Error(`チームID ${team.id.value} はすでに登録されています`);
    }

    // キャプテンが存在するか確認
    const captainExists = this._participants.some((p) => p.id.value === team.captainId.value);

    if (!captainExists) {
      throw new Error(
        `キャプテンID ${team.captainId.value} はこのトーナメントに登録されていません`
      );
    }

    this._teams.push(team);
  }

  updateDraftStatus(draftStatus: DraftStatus): void {
    // ドラフト開始条件の確認
    if (draftStatus.status === 'in_progress' && !this.canStartDraft()) {
      throw new Error('ドラフト開始条件を満たしていません');
    }

    this._draftStatus = draftStatus;
  }

  toggleCaptain(participantId: ParticipantId): Participant {
    // 参加者が存在するか確認
    const participant = this._participants.find((p) => p.id.value === participantId.value);

    if (!participant) {
      throw new Error(`参加者ID ${participantId.value} が見つかりません`);
    }

    // キャプテン状態を切り替え
    participant.toggleCaptain();

    return participant;
  }

  hasCaptain(): boolean {
    return this._participants.some((p) => p.isCaptain);
  }

  getCaptains(): Participant[] {
    return this._participants.filter((p) => p.isCaptain);
  }

  // ドメインロジック
  canStartDraft(): boolean {
    const hasCaptains = this.hasCaptain();
    const hasEnoughParticipants = this._participants.length >= 4;
    const hasTeams = this._teams.length > 0;

    return hasCaptains && hasEnoughParticipants && hasTeams;
  }

  // チームをキャプテンIDで検索
  getTeamByCaptainId(captainId: ParticipantId): Team | undefined {
    return this._teams.find((team) => team.captainId.value === captainId.value);
  }
}
