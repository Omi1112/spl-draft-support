import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';
import { TournamentId } from '../valueObjects/TournamentId';

/**
 * チームエンティティ
 * キャプテンと複数のメンバーで構成されるチームを表します
 */
export class Team {
  private readonly _id: TeamId;
  private _name: string;
  private _captainId: ParticipantId;
  private _memberIds: ParticipantId[];
  private _tournamentId: TournamentId;
  private _createdAt: Date;
  private _isDeleted: boolean;

  private constructor(
    id: TeamId,
    name: string,
    captainId: ParticipantId,
    tournamentId: TournamentId,
    memberIds: ParticipantId[] = [],
    createdAt: Date,
    isDeleted: boolean = false
  ) {
    this._id = id;
    this._name = name;
    this._captainId = captainId;
    this._tournamentId = tournamentId;
    this._memberIds = memberIds;
    this._createdAt = createdAt;
    this._isDeleted = isDeleted;
  }

  /**
   * 新しいチームを作成
   * @param name チーム名
   * @param captainId キャプテンID
   * @param tournamentId トーナメントID
   * @returns 新しいチームエンティティ
   */
  static create(name: string, captainId: ParticipantId, tournamentId: TournamentId): Team {
    const memberIds = [captainId]; // キャプテンは初期メンバーとして追加
    return new Team(TeamId.create(), name, captainId, tournamentId, memberIds, new Date(), false);
  }

  /**
   * 既存のチームデータから復元
   * @param id チームID
   * @param name チーム名
   * @param captainId キャプテンID
   * @param tournamentId トーナメントID
   * @param memberIds メンバーID配列
   * @param createdAt 作成日時
   * @param isDeleted 削除フラグ
   * @returns 復元されたチームエンティティ
   */
  static reconstruct(
    id: string,
    name: string,
    captainId: string,
    tournamentId: string,
    memberIds: string[] = [],
    createdAt: string,
    isDeleted: boolean = false
  ): Team {
    return new Team(
      TeamId.reconstruct(id),
      name,
      ParticipantId.reconstruct(captainId),
      TournamentId.reconstruct(tournamentId),
      memberIds.map((mid) => ParticipantId.reconstruct(mid)),
      new Date(createdAt),
      isDeleted
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
    return [...this._memberIds]; // 配列のコピーを返して不変性を保つ
  }

  get tournamentId(): TournamentId {
    return this._tournamentId;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  /**
   * チームにメンバーを追加する
   * @param participantId 参加者ID
   */
  addMember(participantId: ParticipantId): void {
    if (!this._memberIds.some((id) => id.equals(participantId))) {
      this._memberIds.push(participantId);
    }
  }

  /**
   * チームからメンバーを削除する
   * @param participantId 参加者ID
   */
  removeMember(participantId: ParticipantId): void {
    // キャプテンは削除できない
    if (this._captainId.equals(participantId)) {
      return;
    }
    this._memberIds = this._memberIds.filter((id) => !id.equals(participantId));
  }

  /**
   * チームのキャプテンを変更する
   * @param newCaptainId 新しいキャプテンID
   */
  changeCaptain(newCaptainId: ParticipantId): void {
    // 新しいキャプテンがチームにいなければ追加
    if (!this._memberIds.some((id) => id.equals(newCaptainId))) {
      this._memberIds.push(newCaptainId);
    }
    this._captainId = newCaptainId;
  }

  /**
   * 指定した参加者がチームのメンバーかどうか確認する
   * @param participantId 参加者ID
   * @returns メンバーの場合はtrue
   */
  isMember(participantId: ParticipantId): boolean {
    return this._memberIds.some((id) => id.equals(participantId));
  }

  /**
   * チームを削除する
   */
  delete(): void {
    this._isDeleted = true;
  }
}
