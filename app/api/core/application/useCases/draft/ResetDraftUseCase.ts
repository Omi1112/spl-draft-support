import { DraftRepository } from '../../../domain/repositories/DraftRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';

export class ResetDraftUseCase {
  constructor(private draftRepository: DraftRepository) {}

  /**
   * ドラフトをリセットする - ドラフト関連のデータをすべて削除し、初期状態に戻す
   *
   * @param tournamentId トーナメントID
   * @returns リセット成功したかどうか
   */
  async execute(tournamentId: string): Promise<boolean> {
    try {
      const tournamentIdObj = new TournamentId(tournamentId);
      return await this.draftRepository.reset(tournamentIdObj);
    } catch (error) {
      console.error('ドラフトリセットエラー:', error);
      throw new Error('ドラフトのリセットに失敗しました');
    }
  }
}
