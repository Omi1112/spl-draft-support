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
   * トーナメントのドラフト関連データをすべてリセット（削除して初期状態に戻す）
   * @param tournamentId リセット対象のトーナメントID
   * @returns リセット成功したかどうか
   */
  reset(tournamentId: TournamentId): Promise<boolean>;
}
