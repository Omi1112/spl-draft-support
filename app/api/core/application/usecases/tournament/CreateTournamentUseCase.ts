// filepath: /workspace/app/api/core/application/usecases/tournament/CreateTournamentUseCase.ts
import { injectable, inject } from 'tsyringe';

import { CreateTournamentDto } from '@/app/api/core/application/dto/TournamentDto';
import { Tournament } from '@/app/api/core/domain/entities/Tournament';
import type { TournamentRepository } from '@/app/api/core/domain/repositories/TournamentRepository';


/**
 * 大会作成ユースケース
 */
@injectable()
export class CreateTournamentUseCase {
  constructor(@inject('TournamentRepository') private tournamentRepository: TournamentRepository) {}

  /**
   * 新しい大会を作成する
   * @param dto 大会作成用のデータ
   * @returns 作成された大会エンティティ
   */
  async execute(dto: CreateTournamentDto): Promise<Tournament> {
    // 大会エンティティの新規作成
    const tournament = Tournament.create(dto.name);

    // リポジトリを使用して大会を保存
    return await this.tournamentRepository.save(tournament);
  }
}
