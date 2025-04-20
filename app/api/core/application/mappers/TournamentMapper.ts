import { Tournament } from '../../domain/entities/Tournament';
import { TournamentDto } from '../dto/TournamentDto';

/**
 * Tournamentエンティティとトーナメントビューを変換するマッパー
 */
export class TournamentMapper {
  /**
   * ドメインエンティティからDTOに変換
   * @param tournament Tournamentエンティティ
   * @returns TournamentDto
   */
  static toDto(tournament: Tournament): TournamentDto {
    return {
      id: tournament.id.value,
      name: tournament.nameValue,
      createdAt: tournament.createdAt.toISOString(),
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
