import { Tournament } from '../../../domain/entities/Tournament';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { CreateTournamentDTO, TournamentDTO } from '../../interfaces/DTOs';

export class CreateTournamentUseCase {
  constructor(private tournamentRepository: TournamentRepository) {}

  async execute(dto: CreateTournamentDTO): Promise<TournamentDTO> {
    // トーナメントドメインエンティティの作成
    const tournament = Tournament.create(dto.name);

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
