import { Participant } from '../../domain/entities/Participant';
import { Team } from '../../domain/entities/Team';
import { ParticipantRepository } from '../../domain/repositories/ParticipantRepository';
import { ParticipantId } from '../../domain/valueObjects/ParticipantId';
import { TeamId } from '../../domain/valueObjects/TeamId';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { prisma } from '../persistence/prisma/client';

export class PrismaParticipantRepository implements ParticipantRepository {
  async findById(id: ParticipantId): Promise<Participant | null> {
    const participant = await prisma.participant.findUnique({
      where: { id: id.value },
      include: {
        memberTeams: {
          include: {
            team: true,
          },
        },
        captainTeams: true,
      },
    });

    if (!participant) {
      return null;
    }

    // チーム情報の変換
    let team: Team | undefined;

    // キャプテンとして所属しているチームがあるか確認
    if (participant.captainTeams && participant.captainTeams.length > 0) {
      const teamData = participant.captainTeams[0]; // 最初のチームを取得
      team = new Team(
        new TeamId(teamData.id),
        teamData.name,
        new ParticipantId(teamData.captainId),
        [] // メンバー情報はここでは取得しない
      );
    }
    // メンバーとして所属しているチームがあるか確認
    else if (participant.memberTeams && participant.memberTeams.length > 0) {
      const memberTeam = participant.memberTeams[0]; // 最初のチームを取得
      if (memberTeam.team) {
        team = new Team(
          new TeamId(memberTeam.team.id),
          memberTeam.team.name,
          new ParticipantId(memberTeam.team.captainId),
          [] // メンバー情報はここでは取得しない
        );
      }
    }

    // キャプテンかどうかを判断
    // participantオブジェクトから直接isCaptainプロパティを取得するか、
    // captainTeamsの有無で判断します
    const isCaptainValue =
      'isCaptain' in participant
        ? !!participant.isCaptain
        : participant.captainTeams && participant.captainTeams.length > 0;

    // 参加者エンティティの生成
    return new Participant(
      new ParticipantId(participant.id),
      participant.name,
      participant.weapon,
      participant.xp,
      participant.createdAt,
      isCaptainValue,
      team
    );
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Participant[]> {
    const participants = await prisma.participant.findMany({
      where: {
        participations: {
          some: {
            tournamentId: tournamentId.value,
          },
        },
      },
      include: {
        memberTeams: {
          include: {
            team: true,
          },
        },
        captainTeams: true,
        participations: {
          where: {
            tournamentId: tournamentId.value,
          },
        },
      },
    });

    return participants.map((p) => {
      // チーム情報なしで参加者エンティティを生成
      const isCaptain = p.participations.some((part) => part.isCaptain);
      return new Participant(
        new ParticipantId(p.id),
        p.name,
        p.weapon,
        p.xp,
        p.createdAt,
        isCaptain
      );
    });
  }

  async findCaptains(tournamentId: TournamentId): Promise<Participant[]> {
    const captains = await prisma.participant.findMany({
      where: {
        participations: {
          some: {
            tournamentId: tournamentId.value,
            isCaptain: true,
          },
        },
      },
      include: {
        memberTeams: {
          include: {
            team: true,
          },
        },
        captainTeams: true,
        participations: {
          where: {
            tournamentId: tournamentId.value,
          },
        },
      },
    });

    return captains.map((c) => {
      return new Participant(
        new ParticipantId(c.id),
        c.name,
        c.weapon,
        c.xp,
        c.createdAt,
        true // キャプテンのみを取得するクエリなのでtrue
      );
    });
  }

  async save(participant: Participant): Promise<Participant> {
    // 参加者情報の更新または作成
    const savedParticipant = await prisma.participant.upsert({
      where: { id: participant.id.value },
      update: {
        name: participant.name,
        weapon: participant.weapon,
        xp: participant.xp,
      },
      create: {
        id: participant.id.value,
        name: participant.name,
        weapon: participant.weapon,
        xp: participant.xp,
        createdAt: participant.createdAt,
      },
    });

    // チーム関連の処理
    if (participant.team) {
      const teamId = participant.team.id.value;

      // キャプテンの場合、captainTeamsリレーションを使用
      if (participant.isCaptain) {
        // すでにキャプテンとして別のチームに所属している場合は更新を避ける
        const existingCaptainTeams = await prisma.team.findMany({
          where: {
            captainId: participant.id.value,
            id: { not: teamId },
          },
        });

        // 新しいチームのキャプテンとして設定
        if (existingCaptainTeams.length === 0) {
          await prisma.team.update({
            where: { id: teamId },
            data: {
              captainId: participant.id.value,
            },
          });
        }
      } else {
        // メンバーとしてチームに追加（もし存在しない場合）
        const existingMembership = await prisma.teamMember.findFirst({
          where: {
            teamId: teamId,
            participantId: participant.id.value,
          },
        });

        if (!existingMembership) {
          await prisma.teamMember.create({
            data: {
              teamId: teamId,
              participantId: participant.id.value,
            },
          });
        }
      }
    }

    return participant;
  }

  async delete(id: ParticipantId): Promise<void> {
    await prisma.participant.delete({
      where: { id: id.value },
    });
  }
}
