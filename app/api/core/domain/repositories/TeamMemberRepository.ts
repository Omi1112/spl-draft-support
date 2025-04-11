// filepath: /workspace/app/api/core/domain/repositories/TeamMemberRepository.ts
import { TeamId } from '../valueObjects/TeamId';

/**
 * チームメンバーリポジトリのインターフェース
 */
export interface TeamMemberRepository {
  /**
   * チームIDに紐づくすべてのチームメンバーを削除
   * @param teamId 対象のチームID
   */
  deleteByTeamId(teamId: TeamId): Promise<void>;
}
