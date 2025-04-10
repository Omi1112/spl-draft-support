import { DraftId } from '../valueObjects/DraftId';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TournamentId } from '../valueObjects/TournamentId';

/**
 * ドラフトエンティティ
 * 特定のトーナメントで、あるキャプテンが参加者を指名したことを表す
 */
export class Draft {
  private readonly _id: DraftId;
  private readonly _tournamentId: TournamentId;
  private readonly _captainId: ParticipantId;
  private readonly _participantId: ParticipantId;
  private readonly _round: number;
  private readonly _turn: number;
  private readonly _status: string;
  private readonly _createdAt: Date;

  constructor(
    id: DraftId,
    tournamentId: TournamentId,
    captainId: ParticipantId,
    participantId: ParticipantId,
    round: number,
    turn: number,
    status: string,
    createdAt: Date
  ) {
    this._id = id;
    this._tournamentId = tournamentId;
    this._captainId = captainId;
    this._participantId = participantId;
    this._round = round;
    this._turn = turn;
    this._status = status;
    this._createdAt = createdAt;
  }

  // ゲッター
  get id(): DraftId {
    return this._id;
  }

  get tournamentId(): TournamentId {
    return this._tournamentId;
  }

  get captainId(): ParticipantId {
    return this._captainId;
  }

  get participantId(): ParticipantId {
    return this._participantId;
  }

  get round(): number {
    return this._round;
  }

  get turn(): number {
    return this._turn;
  }

  get status(): string {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
