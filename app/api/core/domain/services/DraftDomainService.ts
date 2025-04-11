// filepath: /workspace/app/api/core/domain/services/DraftDomainServiceImpl.ts
import { TournamentId } from '../valueObjects/TournamentId';
import { DraftRepository } from '../repositories/DraftRepository';
import { TeamRepository } from '../repositories/TeamRepository';
import { TournamentParticipantRepository } from '../repositories/TournamentParticipantRepository';
import { TournamentRepository } from '../repositories/TournamentRepository';

/**
 * ドラフトに関するドメインサービスの実装
 */
export class DraftDomainService {
  constructor(
    private readonly draftRepository: DraftRepository,
    private readonly teamRepository: TeamRepository,
    private readonly tournamentParticipantRepository: TournamentParticipantRepository,
    private readonly tournamentRepository: TournamentRepository
  ) {}

  /**
   * トーナメントのドラフト関連データをすべてリセット（削除して初期状態に戻す）
   * @param tournamentId リセット対象のトーナメントID
   * @returns リセット成功したかどうか
   */
  async resetDraft(tournamentId: TournamentId): Promise<boolean> {
    try {
      // 1. 対象トーナメントの全チームを取得
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        throw new Error('トーナメントが見つかりません');
      }

      tournament.reset();
      await this.tournamentRepository.save(tournament);

      // 3. チームを削除
      await this.teamRepository.deleteByTournamentId(tournamentId);

      // 4. TournamentParticipantの参照をクリア
      await this.tournamentParticipantRepository.clearTeamReferences(tournamentId);

      // 5. ドラフト履歴を削除
      await this.draftRepository.deleteByTournamentId(tournamentId);
      return true;
    } catch (error) {
      console.error('ドラフトリセットエラー:', error);
      throw new Error('ドラフトのリセットに失敗しました');
    }
  }
}
