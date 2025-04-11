import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';

export class Participant {
  private readonly _id: ParticipantId;
  private _name: string;
  private _weapon: string;
  private _xp: number;
  private _createdAt: Date;

  constructor(
    id: ParticipantId,
    name: string,
    weapon: string,
    xp: number,
    createdAt: Date,
    teamId?: TeamId
  ) {
    this._id = id;
    this._name = name;
    this._weapon = weapon;
    this._xp = xp;
    this._createdAt = createdAt;
  }

  /**
   * 新しい参加者を作成
   * @param name 名前
   * @param weapon 武器
   * @param xp 経験値
   * @returns 新しい参加者エンティティ
   */
  static create(name: string, weapon: string, xp: number): Participant {
    return new Participant(ParticipantId.create(), name, weapon, xp, new Date());
  }

  /**
   * 既存の参加者データから復元
   * @param id 参加者ID
   * @param name 名前
   * @param weapon 武器
   * @param xp 経験値
   * @param createdAt 作成日時
   * @returns 復元された参加者エンティティ
   */
  static reconstruct(
    id: string,
    name: string,
    weapon: string,
    xp: number,
    createdAt: Date
  ): Participant {
    return new Participant(ParticipantId.reconstruct(id), name, weapon, xp, createdAt);
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
}
