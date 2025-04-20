// filepath: /workspace/app/api/core/application/dto/DraftDto.ts
import { ParticipantDto } from './ParticipantDto';

/**
 * Draft DTO
 * GraphQLのtypes/Draftに対応するDTO
 */
export interface DraftDto {
  id: string;
  tournamentId: string;
  captainId: string;
  participantId: string;
  round: number;
  turn: number;
  status: string;
  createdAt: string;
  captain?: ParticipantDto;
  participant?: ParticipantDto;
}
