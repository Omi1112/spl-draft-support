export class DraftStatus {
  private readonly _round: number;
  private readonly _turn: number;
  private readonly _isActive: boolean;

  constructor(round: number, turn: number, isActive: boolean) {
    this._round = round;
    this._turn = turn;
    this._isActive = isActive;
  }

  /**
   * 新しいドラフトステータスを作成
   * @returns 新しいドラフトステータス
   */
  static create(): DraftStatus {
    return new DraftStatus(0, 0, false);
  }

  /**
   * 既存のドラフトステータスから復元
   * @param round ラウンド
   * @param turn ターン
   * @param status ステータス
   * @returns 復元されたドラフトステータス
   */
  static reconstruct(round: number, turn: number, isActive: boolean): DraftStatus {
    return new DraftStatus(round, turn, isActive);
  }

  get round(): number {
    return this._round;
  }

  get turn(): number {
    return this._turn;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  start(): DraftStatus {
    return new DraftStatus(1, 1, true);
  }

  nextTurn(): DraftStatus {
    return new DraftStatus(this._round, this._turn + 1, this.isActive);
  }

  nextRound(): DraftStatus {
    return new DraftStatus(this._round + 1, 1, this.isActive);
  }

  complete(): DraftStatus {
    return new DraftStatus(this._round, this._turn, false);
  }

  /**
   * ドラフトステータスをリセット（初期状態に戻す）
   * @returns リセットされたドラフトステータス（ラウンド: 0, ターン: 0, アクティブ: false）
   */
  reset(): DraftStatus {
    return new DraftStatus(0, 0, false);
  }
}
