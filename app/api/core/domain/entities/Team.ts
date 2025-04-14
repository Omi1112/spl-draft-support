import { TeamId } from '../valueObjects/TeamId';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TournamentId } from '../valueObjects/TournamentId';

export class Team {
  private readonly _id: TeamId;
  private _name: string;
  private _captainId: ParticipantId;
  private _memberIds: ParticipantId[];
  private readonly _tournamentId: TournamentId;
  private readonly _createdAt: Date;

  constructor(
    id: TeamId,
    name: string,
    captainId: ParticipantId,
    tournamentId: TournamentId,
    memberIds: ParticipantId[] = [],
    createdAt: Date
  ) {
    this._id = id;
    this._name = name;
    this._captainId = captainId;
    this._tournamentId = tournamentId;
    this._memberIds = memberIds;
    this._createdAt = createdAt;
  }

  /**
   * 新しいチームを作成
   * @param name チーム名
   * @param captainId キャプテンID
   * @param tournamentId トーナメントID
   * @returns 新しいチームエンティティ
   */
  static create(name: string, captainId: ParticipantId, tournamentId: TournamentId): Team {
    return new Team(TeamId.create(), name, captainId, tournamentId, [], new Date());
  }

  /**
   * 既存のチームデータから復元
   * @param id チームID
   * @param name チーム名
   * @param captainId キャプテンID
   * @param tournamentId トーナメントID
   * @param memberIds メンバーID配列
   * @param createdAt 作成日時
   * @returns 復元されたチームエンティティ
   */
  static reconstruct(
    id: string,
    name: string,
    captainId: string,
    tournamentId: string,
    memberIds: string[] = [],
    createdAt: string
  ): Team {
    return new Team(
      TeamId.reconstruct(id),
      name,
      ParticipantId.reconstruct(captainId),
      TournamentId.reconstruct(tournamentId),
      memberIds.map((mid) => ParticipantId.reconstruct(mid)),
      new Date(createdAt)
    );
  }

  // Getters
  get id(): TeamId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get captainId(): ParticipantId {
    return this._captainId;
  }

  get memberIds(): ParticipantId[] {
    return [...this._memberIds];
  }

  get tournamentId(): TournamentId {
    return this._tournamentId;
  }

  addMember(participantId: ParticipantId): void {
    if (!this._memberIds.some((id) => id.equals(participantId))) {
      this._memberIds.push(participantId);
    }
  }

  removeMember(participantId: ParticipantId): void {
    // キャプテンは削除できない
    if (this._captainId.equals(participantId)) {
      return;
    }
    this._memberIds = this._memberIds.filter((id) => !id.equals(participantId));
  }

  changeCaptain(newCaptainId: ParticipantId): void {
    // 新しいキャプテンがチームにいなければ追加
    if (!this._memberIds.some((id) => id.equals(newCaptainId))) {
      this._memberIds.push(newCaptainId);
    }
    this._captainId = newCaptainId;
  }

  isMember(participantId: ParticipantId): boolean {
    return this._memberIds.some((id) => id.equals(participantId));
  }
}
