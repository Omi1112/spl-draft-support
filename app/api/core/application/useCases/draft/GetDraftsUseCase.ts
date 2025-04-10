import { Draft } from '../../../domain/entities/Draft';
import { DraftRepository } from '../../../domain/repositories/DraftRepository';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { DraftDTO } from '../../dtos/draft/DraftDTO';

/**
 * ドラフト一覧取得のユースケース
 */
export class GetDraftsUseCase {
  constructor(private draftRepository: DraftRepository) {}

  /**
   * トーナメントIDでドラフト一覧を取得
   * @param tournamentId
   * @returns
   */
  async executeByTournamentId(tournamentId: string): Promise<DraftDTO[]> {
    const tournamentIdObj = new TournamentId(tournamentId);
    const drafts = await this.draftRepository.findByTournamentId(tournamentIdObj);
    return drafts.map(this.mapToDTO);
  }

  /**
   * トーナメントIDとキャプテンIDでフィルタリングしたドラフト一覧を取得
   * @param tournamentId
   * @param captainId
   * @returns
   */
  async executeByTournamentAndCaptain(
    tournamentId: string,
    captainId: string
  ): Promise<DraftDTO[]> {
    const tournamentIdObj = new TournamentId(tournamentId);
    const captainIdObj = new ParticipantId(captainId);
    const drafts = await this.draftRepository.findByTournamentAndCaptain(
      tournamentIdObj,
      captainIdObj
    );
    return drafts.map(this.mapToDTO);
  }

  /**
   * キャプテンIDでドラフト一覧を取得
   * @param captainId
   * @returns
   */
  async executeByCaptainId(captainId: string): Promise<DraftDTO[]> {
    const captainIdObj = new ParticipantId(captainId);
    const drafts = await this.draftRepository.findByCaptainId(captainIdObj);
    return drafts.map(this.mapToDTO);
  }

  /**
   * ドラフトエンティティをDTOに変換
   * @param draft
   * @returns
   */
  private mapToDTO(draft: Draft): DraftDTO {
    return {
      id: draft.id.value,
      tournamentId: draft.tournamentId.value,
      captainId: draft.captainId.value,
      participantId: draft.participantId.value,
      round: draft.round,
      turn: draft.turn,
      status: draft.status,
      createdAt: draft.createdAt.toISOString(),
      // captain と participant の情報はリゾルバーで取得
    };
  }
}
