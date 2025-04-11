// filepath: /workspace/app/api/core/application/useCases/team/GetTeamsByTournamentIdUseCase.ts
import { Team } from '../../../domain/entities/Team';
import { TeamRepository } from '../../../domain/repositories/TeamRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';

/**
 * トーナメントIDに基づいてチームを取得するユースケース
 */
export class GetTeamsByTournamentIdUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  /**
   * 指定されたトーナメントIDに所属するチームを全て取得する
   *
   * @param tournamentId - チームを取得するトーナメントのID
   * @returns トーナメントに所属するチームのリスト
   */
  async execute(tournamentId: string): Promise<Team[]> {
    try {
      // 文字列のIDをTournamentIdバリューオブジェクトに変換
      const tournamentIdObj = new TournamentId(tournamentId);

      // リポジトリを使用してチームを取得
      const teams = await this.teamRepository.findByTournamentId(tournamentIdObj);

      return teams;
    } catch (error) {
      console.error('GetTeamsByTournamentIdUseCase実行エラー:', error);
      throw new Error(
        `トーナメントIDに基づくチームの取得に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  }
}
