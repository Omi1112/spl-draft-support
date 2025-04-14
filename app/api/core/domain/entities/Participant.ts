import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';

/**
 * 参加者エンティティ
 * ドラフトに参加する個人のプレイヤー情報を表します
 */
export class Participant {
  private readonly _id: ParticipantId;
  private _name: string;
  private _weapon: string;
  private _xp: number;
  private _createdAt: Date;
  private _teamId: TeamId | null;
  private _isCaptain: boolean;

  private constructor(
    id: ParticipantId,
    name: string,
    weapon: string,
    xp: number,
    createdAt: Date,
    teamId: TeamId | null = null,
    isCaptain: boolean = false
  ) {
    this._id = id;
    this._name = name;
    this._weapon = weapon;
    this._xp = xp;
    this._createdAt = createdAt;
    this._teamId = teamId;
    this._isCaptain = isCaptain;
  }

  /**
   * 新しい参加者を作成
   * @param name 名前
   * @param weapon 武器
   * @param xp 経験値
   * @param isCaptain キャプテンかどうか
   * @returns 新しい参加者エンティティ
   */
  static create(name: string, weapon: string, xp: number, isCaptain: boolean = false): Participant {
    return new Participant(ParticipantId.create(), name, weapon, xp, new Date(), null, isCaptain);
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
    teamId: string | null = null,
    isCaptain: boolean = false
  ): Participant {
    return new Participant(
      ParticipantId.reconstruct(id),
      name,
      weapon,
      xp,
      createdAt,
      teamId ? TeamId.reconstruct(teamId) : null,
      isCaptain
    );
  }

  /**
   * 参加者をチームに所属させる
   * @param teamId チームID
   */
  assignToTeam(teamId: TeamId | null): void {
    this._teamId = teamId;
  }

  /**
   * キャプテン状態を切り替える
   */
  toggleCaptainStatus(): void {
    this._isCaptain = !this._isCaptain;
  }

  /**
   * キャプテン状態を設定する
   * @param isCaptain キャプテンかどうか
   */
  setCaptainStatus(isCaptain: boolean): void {
    this._isCaptain = isCaptain;
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

  get isCaptain(): boolean {
    return this._isCaptain;
  }
}
