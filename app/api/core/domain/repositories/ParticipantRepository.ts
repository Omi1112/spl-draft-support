import { Participant } from '../entities/Participant';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TournamentId } from '../valueObjects/TournamentId';

export interface ParticipantRepository {
  findById(id: ParticipantId): Promise<Participant | null>;
  findByTournamentId(tournamentId: TournamentId): Promise<Participant[]>;
  findCaptains(tournamentId: TournamentId): Promise<Participant[]>;
  save(participant: Participant): Promise<Participant>;
  delete(id: ParticipantId): Promise<void>;
}
