import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { DraftDomainService } from '../../../domain/services/DraftDomainService';
import { Team } from '../../../domain/entities/Team';

/**
 * ドラフト開始のユースケース
 */
export class StartDraftUseCase {
  constructor(private readonly draftDomainService: DraftDomainService) {}

  /**
   * ドラフトを開始する
   * @param tournamentId 開始対象のトーナメントID
   * @returns 開始したチームの情報
   */
  async execute(tournamentId: string): Promise<Team> {
    try {
      return await this.draftDomainService.startDraft(new TournamentId(tournamentId));
    } catch (error) {
      console.error('ドラフト開始のエラー:', error);
      throw new Error('ドラフトの開始に失敗しました');
    }
  }
}
