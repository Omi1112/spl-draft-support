import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';
import { TournamentId } from '../valueObjects/TournamentId';
import { TournamentParticipantId } from '../valueObjects/TournamentParticipantId';

/**
 * トーナメント参加者エンティティ
 * トーナメントと参加者の関連を表すエンティティ
 */
export class TournamentParticipant {
  private readonly _id: TournamentParticipantId;
  private _tournamentId: TournamentId;
  private _participantId: ParticipantId;
  private _isCaptain: boolean;
  private _teamId: TeamId | null;
  private _createdAt: Date;

  private constructor(
    id: TournamentParticipantId,
    tournamentId: TournamentId,
    participantId: ParticipantId,
    isCaptain: boolean,
    teamId: TeamId | null,
    createdAt: Date
  ) {
    this._id = id;
    this._tournamentId = tournamentId;
    this._participantId = participantId;
    this._isCaptain = isCaptain;
    this._teamId = teamId;
    this._createdAt = createdAt;
  }

  /**
   * 新しいトーナメント参加者を作成する静的ファクトリメソッド
   * @param tournamentId トーナメントID
   * @param participantId 参加者ID
   * @param isCaptain キャプテンかどうか
   * @param teamId チームID（オプション）
   * @returns 新しいトーナメント参加者エンティティ
   */
  static create(
    tournamentId: TournamentId,
    participantId: ParticipantId,
    isCaptain: boolean = false,
    teamId: TeamId | null = null
  ): TournamentParticipant {
    return new TournamentParticipant(
      TournamentParticipantId.create(),
      tournamentId,
      participantId,
      isCaptain,
      teamId,
      new Date()
    );
  }

  /**
   * 既存のトーナメント参加者データから復元する静的ファクトリメソッド
   * @param id トーナメント参加者ID
   * @param tournamentId トーナメントID
   * @param participantId 参加者ID
   * @param isCaptain キャプテンかどうか
   * @param teamId チームID（オプション）
   * @param createdAt 作成日時
   * @returns 復元されたトーナメント参加者エンティティ
   */
  static reconstruct(
    id: string,
    tournamentId: string,
    participantId: string,
    isCaptain: boolean,
    teamId: string | null,
    createdAt: Date
  ): TournamentParticipant {
    return new TournamentParticipant(
      TournamentParticipantId.reconstruct(id),
      TournamentId.reconstruct(tournamentId),
      ParticipantId.reconstruct(participantId),
      isCaptain,
      teamId ? TeamId.reconstruct(teamId) : null,
      createdAt
    );
  }

  get id(): TournamentParticipantId {
    return this._id;
  }

  get tournamentId(): TournamentId {
    return this._tournamentId;
  }

  get participantId(): ParticipantId {
    return this._participantId;
  }

  get isCaptain(): boolean {
    return this._isCaptain;
  }

  get teamId(): TeamId | null {
    return this._teamId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * キャプテンフラグをトグルする
   */
  toggleCaptainFlag(): void {
    this._isCaptain = !this._isCaptain;
  }

  /**
   * チームIDを更新する
   * @param teamId 新しいチームID
   */
  assignTeam(teamId: TeamId | null): void {
    this._teamId = teamId;
  }

  /**
   * このトーナメント参加者と同じトーナメントと参加者IDを持つか確認する
   * @param tournamentId トーナメントID
   * @param participantId 参加者ID
   * @returns 同じトーナメントと参加者IDを持つ場合はtrue
   */
  hasSameIdentity(tournamentId: TournamentId, participantId: ParticipantId): boolean {
    return (
      this._tournamentId.value === tournamentId.value &&
      this._participantId.value === participantId.value
    );
  }
}
