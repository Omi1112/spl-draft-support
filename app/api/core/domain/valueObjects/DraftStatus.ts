export class DraftStatus {
  private readonly _round: number;
  private readonly _turn: number;
  private readonly _status: 'not_started' | 'in_progress' | 'completed';

  constructor(
    round: number = 1,
    turn: number = 1,
    status: 'not_started' | 'in_progress' | 'completed' = 'not_started'
  ) {
    this._round = round;
    this._turn = turn;
    this._status = status;
  }

  get round(): number {
    return this._round;
  }

  get turn(): number {
    return this._turn;
  }

  get status(): 'not_started' | 'in_progress' | 'completed' {
    return this._status;
  }

  isInProgress(): boolean {
    return this._status === 'in_progress';
  }

  isCompleted(): boolean {
    return this._status === 'completed';
  }

  static start(): DraftStatus {
    return new DraftStatus(1, 1, 'in_progress');
  }

  nextTurn(): DraftStatus {
    return new DraftStatus(this._round, this._turn + 1, this._status);
  }

  nextRound(): DraftStatus {
    return new DraftStatus(this._round + 1, 1, this._status);
  }

  complete(): DraftStatus {
    return new DraftStatus(this._round, this._turn, 'completed');
  }
}
