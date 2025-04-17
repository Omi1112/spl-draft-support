import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';

/**
 * Participantエンティティ
 *
 * 個人のプレイヤー情報のみを保持するエンティティ。
 * - id, name, weapon, xp, createdAt, teamId, isCaptain など
 * - 大会内での状態（キャプテン・チーム等）はTournamentParticipant側で管理
 *
 * 設計方針: 直接操作は最小限とし、必ずTournamentParticipant経由で利用する
 */
export class Participant {
  private readonly _id: ParticipantId;
  private _name: string;
  private _weapon: string;
  private _xp: number;
  private _createdAt: Date;
  private _teamId: TeamId | null;

  private constructor(
    id: ParticipantId,
    name: string,
    weapon: string,
    xp: number,
    createdAt: Date,
    teamId: TeamId | null = null
  ) {
    this._id = id;
    this._name = name;
    this._weapon = weapon;
    this._xp = xp;
    this._createdAt = createdAt;
    this._teamId = teamId;
  }

  /**
   * 新しい参加者を作成
   * @param name 名前
   * @param weapon 武器
   * @param xp 経験値
   * @param isCaptain キャプテンかどうか
   * @returns 新しい参加者エンティティ
   */
  static create(name: string, weapon: string, xp: number): Participant {
    // isCaptainはTournamentParticipantで管理するため、ここでは無視
    return new Participant(ParticipantId.create(), name, weapon, xp, new Date(), null);
  }

  /**
   * 既存の参加者データから復元
   * @param id 参加者ID
   * @param name 名前
   * @param weapon 武器
   * @param xp 経験値
   * @param createdAt 作成日時
   * @param teamId チームID（オプション）
   * @param isCaptain キャプテンかどうか（オプション）
   * @returns 復元された参加者エンティティ
   */
  static reconstruct(
    id: string,
    name: string,
    weapon: string,
    xp: number,
    createdAt: Date,
    teamId: string | null = null
  ): Participant {
    return new Participant(
      ParticipantId.reconstruct(id),
      name,
      weapon,
      xp,
      createdAt,
      teamId ? TeamId.reconstruct(teamId) : null
    );
  }

  /**
   * 参加者をチームに所属させる
   * @param teamId チームID
   */
  assignToTeam(teamId: TeamId | null): void {
    this._teamId = teamId;
  }

  // Getters
  get id(): ParticipantId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get weapon(): string {
    return this._weapon;
  }

  get xp(): number {
    return this._xp;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get teamId(): TeamId | null {
    return this._teamId;
  }
}
