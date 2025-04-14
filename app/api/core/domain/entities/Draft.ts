import { DraftId } from '../valueObjects/DraftId';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TournamentId } from '../valueObjects/TournamentId';

/**
 * ドラフトエンティティ
 * 特定のトーナメントで、あるキャプテンが参加者を指名したことを表す
 */
export class Draft {
  private readonly _id: DraftId;
  private _tournamentId: TournamentId;
  private _captainId: ParticipantId;
  private _participantId: ParticipantId;
  private _round: number;
  private _turn: number;
  private _status: string;
  private _createdAt: Date;

  private constructor(
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

  /**
   * 新しいドラフトを作成
   * @param tournamentId トーナメントID
   * @param captainId キャプテンID
   * @param participantId 参加者ID
   * @param round ラウンド
   * @param turn ターン
   * @param status ステータス
   * @returns 新しいドラフトエンティティ
   */
  static create(
    tournamentId: TournamentId,
    captainId: ParticipantId,
    participantId: ParticipantId,
    round: number,
    turn: number,
    status: string
  ): Draft {
    return new Draft(
      DraftId.create(),
      tournamentId,
      captainId,
      participantId,
      round,
      turn,
      status,
      new Date()
    );
  }

  /**
   * 既存のドラフトデータから復元
   * @param id ドラフトID
   * @param tournamentId トーナメントID
   * @param captainId キャプテンID
   * @param participantId 参加者ID
   * @param round ラウンド
   * @param turn ターン
   * @param status ステータス
   * @param createdAt 作成日時
   * @returns 復元されたドラフトエンティティ
   */
  static reconstruct(
    id: string,
    tournamentId: string,
    captainId: string,
    participantId: string,
    round: number,
    turn: number,
    status: string,
    createdAt: Date
  ): Draft {
    return new Draft(
      DraftId.reconstruct(id),
      TournamentId.reconstruct(tournamentId),
      ParticipantId.reconstruct(captainId),
      ParticipantId.reconstruct(participantId),
      round,
      turn,
      status,
      createdAt
    );
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
