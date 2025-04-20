// filepath: /workspace/app/api/core/application/usecases/tournament/GetTournamentsUseCase.ts
import { injectable, inject } from 'tsyringe';

import { Tournament } from '@/app/api/core/domain/entities/Tournament';
import type { TournamentRepository } from '@/app/api/core/domain/repositories/TournamentRepository';

/**
 * 大会一覧取得ユースケース
 */
@injectable()
export class GetTournamentsUseCase {
  constructor(@inject('TournamentRepository') private tournamentRepository: TournamentRepository) {}

  /**
   * すべての大会を取得する
   * @returns 大会エンティティの配列
   */
  async execute(): Promise<Tournament[]> {
    // リポジトリを使用して全大会を取得
    return await this.tournamentRepository.findAll();
  }
}
