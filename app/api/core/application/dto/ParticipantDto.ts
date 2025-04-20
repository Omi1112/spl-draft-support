// Participant DTO
// GraphQLのtypes/Participantに対応するDTO
export interface ParticipantDto {
  id: string;
  name: string;
  weapon: string;
  isCaptain: boolean;
  xp: number;
  createdAt: string;
}
