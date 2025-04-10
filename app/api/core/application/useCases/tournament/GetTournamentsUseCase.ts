import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentDTO } from '../../interfaces/DTOs';

export class GetTournamentsUseCase {
  constructor(private tournamentRepository: TournamentRepository) {}

  async execute(): Promise<TournamentDTO[]> {
    const tournaments = await this.tournamentRepository.findAll();

    return tournaments.map((tournament) => ({
      id: tournament.id.value,
      name: tournament.name,
      createdAt: tournament.createdAt.toISOString(),
    }));
  }
}
