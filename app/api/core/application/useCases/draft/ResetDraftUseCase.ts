// filepath: /workspace/app/api/core/application/useCases/draft/ResetDraftUseCase.ts
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { DraftDomainService } from '../../../domain/services/DraftDomainService';

/**
 * ドラフトリセットのユースケース
 */
export class ResetDraftUseCase {
  constructor(private readonly draftDomainService: DraftDomainService) {}

  /**
   * ドラフト関連データをすべてリセットする
   * @param tournamentId リセット対象のトーナメントID
   * @returns リセット成功したかどうか
   */
  async execute(tournamentId: string): Promise<boolean> {
    try {
      return await this.draftDomainService.resetDraft(new TournamentId(tournamentId));
    } catch (error) {
      console.error('ドラフトリセットのエラー:', error);
      throw new Error('ドラフトのリセットに失敗しました');
    }
  }
}
