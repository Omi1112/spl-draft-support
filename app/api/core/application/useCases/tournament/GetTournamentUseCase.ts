import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TeamRepository } from '../../../domain/repositories/TeamRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { TournamentDTO } from '../../interfaces/DTOs';

export class GetTournamentUseCase {
  constructor(
    private readonly tournamentRepository: TournamentRepository,
    private readonly participantRepository: ParticipantRepository,
    private readonly teamRepository: TeamRepository
  ) {}

  async execute(id: string): Promise<TournamentDTO | null> {
    const tournamentId = new TournamentId(id);
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      return null;
    }

    // 参加者情報の取得
    // ここではtournamentParticipants主軸・Participantネスト型で返却する
    const participants = await this.participantRepository.findByTournamentId(tournamentId);

    // チーム情報の取得
    const teams = await this.teamRepository.findByTournamentId(tournamentId);

    return {
      id: tournament.id.value,
      name: tournament.name,
      createdAt: tournament.createdAt.toISOString(),
      tournamentParticipants: participants.map((p) => ({
        id: p.id.value,
        tournament: {
          id: tournament.id.value,
          name: tournament.name,
          createdAt: tournament.createdAt.toISOString(),
        },
        participant: {
          id: p.id.value,
          name: p.name,
          weapon: p.weapon,
          xp: p.xp,
          createdAt: p.createdAt.toISOString(),
          isCaptain: false, // 必要に応じて正しい値に修正
        },
        isCaptain: false, // 必要に応じて正しい値に修正
        createdAt: p.createdAt.toISOString(),
        tournamentId: tournament.id.value,
        participantId: p.id.value,
      })),
      teams: teams.map((t) => ({
        id: t.id.value,
        name: t.name,
        captainId: t.captainId.value,
        memberIds: t.memberIds.map((id) => id.value),
      })),
      draftStatus: tournament.draftStatus
        ? {
            round: tournament.draftStatus.round,
            turn: tournament.draftStatus.turn,
            isActive: tournament.draftStatus.isActive,
          }
        : undefined,
    };
  }
}
