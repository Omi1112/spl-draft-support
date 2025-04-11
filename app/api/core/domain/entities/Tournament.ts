import { DraftStatus } from '../valueObjects/DraftStatus';
import { TournamentId } from '../valueObjects/TournamentId';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';

export class Tournament {
  private readonly _id: TournamentId;
  private _name: string;
  private _createdAt: Date;
  private _draftStatus?: DraftStatus;

  constructor(id: TournamentId, name: string, createdAt: Date, draftStatus: DraftStatus) {
    this._id = id;
    this._name = name;
    this._createdAt = createdAt;
    this._draftStatus = draftStatus;
  }

  /**
   * 新しいトーナメントを作成
   * @param name トーナメント名
   * @returns 新しいトーナメントエンティティ
   */
  static create(name: string): Tournament {
    return new Tournament(TournamentId.create(), name, new Date(), DraftStatus.create());
  }

  /**
   * 既存のトーナメントデータから復元
   * @param id トーナメントID
   * @param name トーナメント名
   * @param createdAt 作成日時
   * @param teamIds チームID配列
   * @param draftStatus ドラフトステータス
   * @returns 復元されたトーナメントエンティティ
   */
  static reconstruct(
    id: string,
    name: string,
    createdAt: Date,
    draftStatus: DraftStatus
  ): Tournament {
    return new Tournament(TournamentId.reconstruct(id), name, createdAt, draftStatus);
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

  get draftStatus(): DraftStatus | undefined {
    return this._draftStatus;
  }
}
