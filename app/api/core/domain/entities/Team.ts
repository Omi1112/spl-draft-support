import { TeamId } from '../valueObjects/TeamId';
import { ParticipantId } from '../valueObjects/ParticipantId';

export class Team {
  private readonly _id: TeamId;
  private _name: string;
  private _captainId: ParticipantId;
  private _memberIds: ParticipantId[];

  constructor(id: TeamId, name: string, captainId: ParticipantId, memberIds: ParticipantId[] = []) {
    this._id = id;
    this._name = name;
    this._captainId = captainId;
    this._memberIds = memberIds.length > 0 ? memberIds : [captainId];
  }

  // Getters
  get id(): TeamId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get captainId(): ParticipantId {
    return this._captainId;
  }

  get memberIds(): ParticipantId[] {
    return [...this._memberIds];
  }

  // Methods
  addMember(participantId: ParticipantId): void {
    if (!this._memberIds.some((id) => id.equals(participantId))) {
      this._memberIds.push(participantId);
    }
  }

  removeMember(participantId: ParticipantId): void {
    // キャプテンは削除できない
    if (this._captainId.equals(participantId)) {
      return;
    }
    this._memberIds = this._memberIds.filter((id) => !id.equals(participantId));
  }

  changeCaptain(newCaptainId: ParticipantId): void {
    // 新しいキャプテンがチームにいなければ追加
    if (!this._memberIds.some((id) => id.equals(newCaptainId))) {
      this._memberIds.push(newCaptainId);
    }
    this._captainId = newCaptainId;
  }

  // ドメインロジック
  isMember(participantId: ParticipantId): boolean {
    return this._memberIds.some((id) => id.equals(participantId));
  }
}
