import { Team } from './Team';
import { ParticipantId } from '../valueObjects/ParticipantId';

export class Participant {
  private readonly _id: ParticipantId;
  private _name: string;
  private _weapon: string;
  private _xp: number;
  private _createdAt: Date;
  private _isCaptain: boolean;
  private _team?: Team;

  constructor(
    id: ParticipantId,
    name: string,
    weapon: string,
    xp: number,
    createdAt: Date,
    isCaptain: boolean = false,
    team?: Team
  ) {
    this._id = id;
    this._name = name;
    this._weapon = weapon;
    this._xp = xp;
    this._createdAt = createdAt;
    this._isCaptain = isCaptain;
    this._team = team;
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

  get isCaptain(): boolean {
    return this._isCaptain;
  }

  get team(): Team | undefined {
    return this._team;
  }

  // Methods
  assignToTeam(team: Team): void {
    this._team = team;
  }

  removeFromTeam(): void {
    this._team = undefined;
  }

  makeCaptain(): void {
    this._isCaptain = true;
  }

  removeCaptainRole(): void {
    this._isCaptain = false;
  }

  // キャプテン状態を切り替えるメソッド
  toggleCaptain(): void {
    if (this._isCaptain) {
      this.removeCaptainRole();
    } else {
      this.makeCaptain();
    }
  }
}
