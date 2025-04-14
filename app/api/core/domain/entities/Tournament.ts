import { DraftStatus } from '../valueObjects/DraftStatus';
import { TournamentId } from '../valueObjects/TournamentId';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';

export class Tournament {
  private readonly _id: TournamentId;
  private _name: string;
  private _createdAt: Date;
  private _draftStatus?: DraftStatus;
  private _currentCaptainId?: ParticipantId; // ドラフト中の現在のキャプテンID

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

  /**
   * ドラフトを開始する
   * ラウンド1、ターン1で開始し、アクティブな状態にする
   */
  startDraft(): void {
    if (!this._draftStatus) {
      this._draftStatus = DraftStatus.create();
    }
    this._draftStatus.start();
    // ここでは簡易的な実装としてキャプテンIDはnullにしておく
    // 実際の実装では最初のターンのキャプテンIDを設定する必要がある
    this._currentCaptainId = undefined;
  }

  /**
   * ドラフトをリセットする
   * ドラフトに関連するデータをクリアする
   */
  reset(): void {
    if (this._draftStatus) {
      this._draftStatus.reset();
    }
    this._currentCaptainId = undefined;
  }

  /**
   * 現在のドラフトターンのキャプテンIDを取得する
   * 実際の実装ではドラフトの状態から適切なキャプテンを決定する
   */
  getCurrentCaptainId(): ParticipantId | undefined {
    return this._currentCaptainId;
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
