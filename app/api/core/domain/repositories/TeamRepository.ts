import { Team } from '../entities/Team';
import { TeamId } from '../valueObjects/TeamId';
import { TournamentId } from '../valueObjects/TournamentId';
import { ParticipantId } from '../valueObjects/ParticipantId';

export interface TeamRepository {
  findById(id: TeamId): Promise<Team | null>;
  findByTournamentId(tournamentId: TournamentId): Promise<Team[]>;
  findByCaptainId(captainId: ParticipantId): Promise<Team | null>;
  save(team: Team): Promise<Team>;
  delete(id: TeamId): Promise<void>;
}
