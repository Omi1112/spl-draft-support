// モジュールとして認識されるためのダミー型
export type TournamentParticipantRepositoryType = 'TournamentParticipantRepository';

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
    tournamentId: string,
    participantId: string
  ): Promise<{
    id: string;
    tournamentId: string;
    participantId: string;
    isCaptain: boolean;
    teamId?: string | null;
    createdAt: Date;
  } | null>;

  /**
   * 参加者のキャプテンフラグを更新
   * @param tournamentId トーナメントID
   * @param participantId 参加者ID
   * @param isCaptain キャプテンかどうかのフラグ
   * @returns 更新された参加者情報
   */
  updateCaptainFlag(
    tournamentId: string,
    participantId: string,
    isCaptain: boolean
  ): Promise<{
    id: string;
    tournamentId: string;
    participantId: string;
    isCaptain: boolean;
    teamId?: string | null;
    createdAt: Date;
  }>;

  /**
   * トーナメント参加者情報を更新
   * @param tournamentId トーナメントID
   * @param participantId 参加者ID
   * @param data 更新データ
   * @returns 更新された参加者情報
   */
  update(
    tournamentId: string,
    participantId: string,
    data: { isCaptain?: boolean }
  ): Promise<{
    id: string;
    tournamentId: string;
    participantId: string;
    isCaptain: boolean;
    teamId?: string | null;
    createdAt: Date;
  }>;
}
