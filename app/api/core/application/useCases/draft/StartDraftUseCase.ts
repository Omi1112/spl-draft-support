import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { DraftDomainService } from '../../../domain/services/DraftDomainService';

/**
 * ドラフト開始のユースケース
 */
export class StartDraftUseCase {
  constructor(private readonly draftDomainService: DraftDomainService) {}

  /**
   * ドラフトを開始する
   * @param tournamentId 開始対象のトーナメントID
   * @returns Promise<void> - 成功時は void、失敗時は例外をスロー
   */
  async execute(tournamentId: string): Promise<void> {
    try {
      await this.draftDomainService.startDraft(new TournamentId(tournamentId));
    } catch (error) {
      console.error('ドラフト開始のエラー:', error);
      throw new Error('ドラフトの開始に失敗しました');
    }
  }
}
