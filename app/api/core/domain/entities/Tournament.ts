import { DraftStatus } from '../valueObjects/DraftStatus';
import { TournamentId } from '../valueObjects/TournamentId';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';

/**
 * トーナメントエンティティ
 * 大会の基本情報とドラフト状態を管理します
 */
export class Tournament {
  private readonly _id: TournamentId;
  private _name: string;
  private _createdAt: Date;
  private _draftStatus?: DraftStatus;
  private _currentCaptainId?: ParticipantId; // ドラフト中の現在のキャプテンID

  private constructor(id: TournamentId, name: string, createdAt: Date, draftStatus?: DraftStatus) {
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
    return new Tournament(TournamentId.create(), name, new Date());
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
    draftStatusRound?: number,
    draftStatusTurn?: number,
    draftStatusIsActive?: boolean
  ): Tournament {
    const tournament = new Tournament(TournamentId.reconstruct(id), name, createdAt);

    // ドラフトステータスが存在する場合のみ設定する
    if (
      draftStatusRound !== undefined &&
      draftStatusTurn !== undefined &&
      draftStatusIsActive !== undefined
    ) {
      tournament._draftStatus = new DraftStatus(
        draftStatusRound,
        draftStatusTurn,
        draftStatusIsActive
      );
    }

    return tournament;
  }

  /**
   * ドラフトを開始する
   * ラウンド1、ターン1で開始し、アクティブな状態にする
   */
  startDraft(): void {
    if (!this._draftStatus) {
      this._draftStatus = new DraftStatus(1, 1, true);
    } else {
      this._draftStatus = new DraftStatus(1, 1, true);
    }
    // ここでは簡易的な実装としてキャプテンIDはnullにしておく
    // 実際の実装では最初のターンのキャプテンIDを設定する必要がある
    this._currentCaptainId = undefined;
  }

  /**
   * ドラフトをリセットする
   * ドラフトに関連するデータをクリアする
   */
  reset(): void {
    this._draftStatus = undefined;
    this._currentCaptainId = undefined;
  }

  /**
   * ドラフトステータスを更新する
   * @param draftStatus 新しいドラフトステータス
   */
  updateDraftStatus(draftStatus: DraftStatus): void {
    this._draftStatus = draftStatus;
  }

  /**
   * 現在のドラフトターンのキャプテンIDを設定する
   * @param captainId キャプテンID
   */
  setCurrentCaptainId(captainId: ParticipantId): void {
    this._currentCaptainId = captainId;
  }

  /**
   * 現在のドラフトターンのキャプテンIDを取得する
   * @returns キャプテンID（未設定の場合はundefined）
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
