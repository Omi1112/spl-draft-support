// filepath: /workspace/app/api/core/domain/repositories/TournamentParticipantRepository.ts
import { TournamentParticipant } from '../entities/TournamentParticipant';
import { TournamentParticipantId } from '../valueObjects/TournamentParticipantId';
import { TournamentId } from '../valueObjects/TournamentId';
import { ParticipantId } from '../valueObjects/ParticipantId';

/**
 * トーナメント参加者リポジトリのインターフェース
 * トーナメントと参加者の関連を管理するためのリポジトリ
 */
export interface TournamentParticipantRepository {
  /**
   * 特定のトーナメントと参加者の組み合わせを検索
   * @param tournamentId トーナメントID
   * @param participantId 参加者ID
   * @returns トーナメント参加者情報、見つからない場合はnull
   */
  findByTournamentAndParticipant(
    tournamentId: TournamentId,
    participantId: ParticipantId
  ): Promise<TournamentParticipant | null>;

  /**
   * IDによるトーナメント参加者の検索
   * @param id トーナメント参加者ID
   * @returns トーナメント参加者情報、見つからない場合はnull
   */
  findById(id: TournamentParticipantId): Promise<TournamentParticipant | null>;

  /**
   * トーナメントに参加している参加者の情報をすべて取得
   * @param tournamentId トーナメントID
   * @returns トーナメント参加者情報の配列
   */
  findByTournamentId(tournamentId: TournamentId): Promise<TournamentParticipant[]>;

  /**
   * トーナメント参加者情報を保存
   * @param tournamentParticipant 保存するトーナメント参加者情報
   * @returns 保存されたトーナメント参加者情報
   */
  save(tournamentParticipant: TournamentParticipant): Promise<TournamentParticipant>;
  /**
   * トーナメント参加者情報を削除
   * @param id 削除するトーナメント参加者のID
   */
  delete(id: TournamentParticipantId): Promise<void>;

  /**
   * トーナメントに所属する全参加者のチーム参照をクリア
   * @param tournamentId トーナメントID
   */
  clearTeamReferences(tournamentId: TournamentId): Promise<void>;
}
