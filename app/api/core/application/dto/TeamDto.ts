// Team DTO
// GraphQLのtypes/Teamに対応するDTO
export interface TeamDto {
  id: string;
  name: string;
  captainId: string;
  captain?: ParticipantDto;
  members: ParticipantDto[];
  createdAt?: string;
}

// ParticipantDtoをインポート
import { ParticipantDto } from './ParticipantDto';
