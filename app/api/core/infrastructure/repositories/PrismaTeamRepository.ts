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

    return new Team(
      new TeamId(team.id),
      team.name,
      new ParticipantId(team.captainId),
      new TournamentId(team.tournamentId),
      team.members.map((m) => new ParticipantId(m.id)),
      team.createdAt
    );
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { tournamentId: tournamentId.value },
      include: { members: true },
    });

    return teams.map(
      (team) =>
        new Team(
          new TeamId(team.id),
          team.name,
          new ParticipantId(team.captainId),
          new TournamentId(team.tournamentId),
          team.members.map((m) => new ParticipantId(m.id)),
          team.createdAt
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

    return new Team(
      new TeamId(team.id),
      team.name,
      new ParticipantId(team.captainId),
      new TournamentId(team.tournamentId),
      team.members.map((m) => new ParticipantId(m.id)),
      team.createdAt
    );
  }

  async save(team: Team): Promise<Team> {
    // チーム情報の更新または作成
    await prisma.team.upsert({
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

    return team;
  }

  async delete(id: TeamId): Promise<void> {
    // まずチームメンバーの関連付けを解除
    await prisma.teamMember.deleteMany({
      where: {
        teamId: id.value,
      },
    });

    // チームを削除
    await prisma.team.delete({
      where: { id: id.value },
    });
  }

  /**
   * トーナメントIDに紐づくすべてのチームを削除
   * @param tournamentId 対象のトーナメントID
   */
  async deleteByTournamentId(tournamentId: TournamentId): Promise<void> {
    // 特定のトーナメントに属するすべてのチームを削除
    // このメソッドは、DraftDomainServiceで使用されるため、
    // チームメンバーの削除は別途TeamMemberRepositoryで行う
    await prisma.team.deleteMany({
      where: { tournamentId: tournamentId.value },
    });
  }

  /**
   * トーナメントIDとキャプテンIDに紐づくチームを検索
   * @param tournamentId 対象のトーナメントID
   * @param captainId 対象のキャプテンID (省略可)
   * @returns 見つかったチーム、見つからない場合はnull
   */
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

      return new Team(
        new TeamId(team.id),
        team.name,
        new ParticipantId(team.captainId),
        new TournamentId(team.tournamentId),
        team.members.map((m) => new ParticipantId(m.id)),
        team.createdAt
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

    return new Team(
      new TeamId(team.id),
      team.name,
      new ParticipantId(team.captainId),
      team.members.map((m) => new ParticipantId(m.id))
    );
  }
}
