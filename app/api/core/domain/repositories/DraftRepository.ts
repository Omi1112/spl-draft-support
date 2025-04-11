import { Draft } from '../entities/Draft';
import { DraftId } from '../valueObjects/DraftId';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TournamentId } from '../valueObjects/TournamentId';

/**
 * ドラフトリポジトリのインターフェース
 */
export interface DraftRepository {
  findById(id: DraftId): Promise<Draft | null>;
  findByTournamentId(tournamentId: TournamentId): Promise<Draft[]>;
  findByCaptainId(captainId: ParticipantId): Promise<Draft[]>;
  findByTournamentAndCaptain(
    tournamentId: TournamentId,
    captainId: ParticipantId
  ): Promise<Draft[]>;
  save(draft: Draft): Promise<Draft>;
  delete(id: DraftId): Promise<void>;

  /**
   * トーナメントIDに紐づくすべてのドラフトを削除
   * @param tournamentId 対象のトーナメントID
   */
  deleteByTournamentId(tournamentId: TournamentId): Promise<void>;
}
