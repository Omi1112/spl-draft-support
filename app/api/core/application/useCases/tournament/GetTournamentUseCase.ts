import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { TournamentDTO } from '../../interfaces/DTOs';

export class GetTournamentUseCase {
  constructor(private tournamentRepository: TournamentRepository) {}

  async execute(id: string): Promise<TournamentDTO> {
    const tournamentId = new TournamentId(id);
    const tournament = await this.tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new Error('トーナメントが見つかりません');
    }

    return {
      id: tournament.id.value,
      name: tournament.name,
      createdAt: tournament.createdAt.toISOString(),
      participants: tournament.participants.map((p) => ({
        id: p.id.value,
        name: p.name,
        weapon: p.weapon,
        xp: p.xp,
        createdAt: p.createdAt.toISOString(),
        isCaptain: p.isCaptain || false,
        teamId: p.team?.id.value,
      })),
      teams: tournament.teams.map((t) => ({
        id: t.id.value,
        name: t.name,
        captainId: t.captainId.value,
        memberIds: t.memberIds.map((id) => id.value),
      })),
      draftStatus: tournament.draftStatus
        ? {
            round: tournament.draftStatus.round,
            turn: tournament.draftStatus.turn,
            status: tournament.draftStatus.status,
          }
        : undefined,
    };
  }
}
