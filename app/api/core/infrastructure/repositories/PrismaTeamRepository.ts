import { Team } from '../../domain/entities/Team';
import { TeamRepository } from '../../domain/repositories/TeamRepository';
import { ParticipantId } from '../../domain/valueObjects/ParticipantId';
import { TeamId } from '../../domain/valueObjects/TeamId';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { prisma } from '../persistence/prisma/client';

export class PrismaTeamRepository implements TeamRepository {
  async findById(id: TeamId): Promise<Team | null> {
    const team = await prisma.team.findUnique({
      where: { id: id.value },
      include: { members: true },
    });

    if (!team) {
      return null;
    }

    return Team.reconstruct(
      team.id,
      team.name,
      team.captainId,
      team.tournamentId,
      team.members.map((m) => m.participantId), // TeamMemberからparticipantIdを取得
      team.createdAt.toISOString()
    );
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { tournamentId: tournamentId.value },
      include: { members: true },
    });

    return teams.map((team) =>
      Team.reconstruct(
        team.id,
        team.name,
        team.captainId,
        team.tournamentId,
        team.members.map((m) => m.participantId), // TeamMemberからparticipantIdを取得
        team.createdAt.toISOString()
      )
    );
  }

  async findByCaptainId(captainId: ParticipantId): Promise<Team | null> {
    const team = await prisma.team.findFirst({
      where: { captainId: captainId.value },
      include: { members: true },
    });

    if (!team) {
      return null;
    }

    return Team.reconstruct(
      team.id,
      team.name,
      team.captainId,
      team.tournamentId,
      team.members.map((m) => m.participantId), // TeamMemberからparticipantIdを取得
      team.createdAt.toISOString()
    );
  }

  async save(team: Team): Promise<Team> {
    // チームが削除済みの場合は例外をスロー
    if (team.isDeleted) {
      throw new Error(`削除済みのチームは保存できません。チームID: ${team.id.value}`);
    }

    // チーム情報の更新または作成
    const savedPrismaTeam = await prisma.team.upsert({
      where: { id: team.id.value },
      update: {
        name: team.name,
        captainId: team.captainId.value,
        tournamentId: team.tournamentId.value,
      },
      create: {
        id: team.id.value,
        name: team.name,
        captainId: team.captainId.value,
        tournamentId: team.tournamentId.value,
      },
      include: { members: true }, // 保存後にメンバー情報も含めて取得
    });

    // チームメンバーの関連付け - 既存のメンバーをリセットして再設定
    // Prismaのスキーマに基づいて、メンバー関連付けを解除
    await prisma.teamMember.deleteMany({
      where: {
        teamId: team.id.value,
      },
    });

    // 各メンバーをチームに関連付け
    for (const memberId of team.memberIds) {
      await prisma.teamMember.create({
        data: {
          teamId: team.id.value,
          participantId: memberId.value,
        },
      });
    }

    // 保存/更新されたデータを基にTeamエンティティを再構築して返す
    const updatedTeamMembers = await prisma.teamMember.findMany({
      where: { teamId: savedPrismaTeam.id },
    });

    return Team.reconstruct(
      savedPrismaTeam.id,
      savedPrismaTeam.name,
      savedPrismaTeam.captainId,
      savedPrismaTeam.tournamentId,
      updatedTeamMembers.map((m) => m.participantId),
      savedPrismaTeam.createdAt.toISOString()
      // isDeleted はデフォルトで false
    );
  }

  async delete(team: Team): Promise<void> {
    // 引数を Team に変更
    // 削除フラグが立っていない場合はエラー
    if (!team.isDeleted) {
      throw new Error(`チームID ${team.id.value} は削除対象としてマークされていません。`);
    }

    // チームメンバーの削除
    await prisma.teamMember.deleteMany({
      where: {
        teamId: team.id.value, // team.id を使用
      },
    });

    // チームの削除
    await prisma.team.delete({
      where: {
        id: team.id.value, // team.id を使用
      },
    });
  }

  /**
   * トーナメントIDに紐づくすべてのチームを削除
   * @param tournamentId 対象のトーナメントID
   */
  async deleteByTournamentId(tournamentId: TournamentId): Promise<void> {
    try {
      // トーナメントに関連するすべてのチームを取得
      const teams = await prisma.team.findMany({
        where: { tournamentId: tournamentId.value },
        select: { id: true },
      });

      // チームIDの配列を取得
      const teamIds = teams.map((team) => team.id);

      if (teamIds.length > 0) {
        // 1. まず、関連するチームメンバーを削除（外部キー制約を考慮）
        await prisma.teamMember.deleteMany({
          where: {
            teamId: {
              in: teamIds,
            },
          },
        });
      }

      // 2. チームを削除
      await prisma.team.deleteMany({
        where: { tournamentId: tournamentId.value },
      });
    } catch (error) {
      console.error('トーナメント関連チーム削除エラー:', error);
      throw error;
    }
  }

  async findByTournamentIdAndCaptainId(
    tournamentId: TournamentId,
    captainId?: ParticipantId
  ): Promise<Team | null> {
    // キャプテンIDが指定されていない場合は、そのトーナメントの最初のチームを返す
    if (!captainId) {
      const team = await prisma.team.findFirst({
        where: { tournamentId: tournamentId.value },
        include: { members: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!team) {
        return null;
      }

      return Team.reconstruct(
        team.id,
        team.name,
        team.captainId,
        team.tournamentId,
        team.members.map((m) => m.participantId), // TeamMemberからparticipantIdを取得
        team.createdAt.toISOString()
      );
    }

    // キャプテンIDが指定されている場合は、トーナメントIDとキャプテンIDの両方で検索
    const team = await prisma.team.findFirst({
      where: {
        tournamentId: tournamentId.value,
        captainId: captainId.value,
      },
      include: { members: true },
    });

    if (!team) {
      return null;
    }

    return Team.reconstruct(
      team.id,
      team.name,
      team.captainId,
      team.tournamentId,
      team.members.map((m) => m.participantId),
      team.createdAt.toISOString()
    );
  }
}
