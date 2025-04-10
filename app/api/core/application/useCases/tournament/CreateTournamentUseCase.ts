import { Tournament } from '../../../domain/entities/Tournament';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { CreateTournamentDTO, TournamentDTO } from '../../interfaces/DTOs';

export class CreateTournamentUseCase {
  constructor(private tournamentRepository: TournamentRepository) {}

  async execute(dto: CreateTournamentDTO): Promise<TournamentDTO> {
    // 一意のIDを生成 (実際の実装ではUUIDライブラリなどを使用)
    const id = `tournament-${Date.now()}`;
    const tournamentId = new TournamentId(id);

    // トーナメントドメインエンティティの作成
    const tournament = new Tournament(tournamentId, dto.name, new Date(), [], []);

    // リポジトリを利用して保存
    const savedTournament = await this.tournamentRepository.save(tournament);

    // DTOに変換して返却
    return {
      id: savedTournament.id.value,
      name: savedTournament.name,
      createdAt: savedTournament.createdAt.toISOString(),
    };
  }
}
