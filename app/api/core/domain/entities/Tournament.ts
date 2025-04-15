import { DraftStatus } from '../valueObjects/DraftStatus';
import { TournamentId } from '../valueObjects/TournamentId';


/**
 * トーナメントエンティティ
 * 大会の基本情報とドラフト状態を管理します
 */
export class Tournament {
  private readonly _id: TournamentId;
  private _name: string;
  private _createdAt: Date;
  private _draftStatus: DraftStatus;

  private constructor(id: TournamentId, name: string, createdAt: Date, draftStatus: DraftStatus) {
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
   * @param draftStatus ドラフトステータス
   * @returns 復元されたトーナメントエンティティ
   */
  static reconstruct(
    id: string,
    name: string,
    createdAt: Date,
    draftStatus: DraftStatus
  ): Tournament {
    const tournament = new Tournament(TournamentId.reconstruct(id), name, createdAt, draftStatus);

    return tournament;
  }

  /**
   * ドラフトを開始する
   * ラウンド1、ターン1で開始し、アクティブな状態にする
   */
  startDraft(): void {
    this._draftStatus = this._draftStatus.start();
  }

  /**
   * ドラフトをリセットする
   * ドラフトに関連するデータをクリアする
   */
  reset(): void {
    this._draftStatus = this._draftStatus.reset();
  }

  /**
   * ドラフトステータスを更新する
   * @param draftStatus 新しいドラフトステータス
   */
  updateDraftStatus(draftStatus: DraftStatus): void {
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

  get draftStatus(): DraftStatus | undefined {
    return this._draftStatus;
  }
}
