import { Tournament } from '../entities/Tournament';
import { TournamentId } from '../valueObjects/TournamentId';

export interface TournamentRepository {
  findAll(): Promise<Tournament[]>;
  findById(id: TournamentId): Promise<Tournament | null>;
  save(tournament: Tournament): Promise<Tournament>;
  delete(id: TournamentId): Promise<void>;
}
