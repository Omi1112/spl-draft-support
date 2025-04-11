// filepath: /workspace/app/api/core/infrastructure/repositories/PrismaTeamMemberRepository.ts
import { TeamMemberRepository } from '../../domain/repositories/TeamMemberRepository';
import { TeamId } from '../../domain/valueObjects/TeamId';
import { prisma } from '../persistence/prisma/client';

/**
 * チームメンバーリポジトリのPrisma実装
 */
export class PrismaTeamMemberRepository implements TeamMemberRepository {
  /**
   * チームIDに紐づくすべてのチームメンバーを削除
   * @param teamId 対象のチームID
   */
  async deleteByTeamId(teamId: TeamId): Promise<void> {
    await prisma.teamMember.deleteMany({
      where: { teamId: teamId.value },
    });
  }
}
