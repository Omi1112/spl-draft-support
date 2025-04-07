// filepath: /workspace/app/api/graphql/resolvers/tournament/teamResolvers.ts
import prisma from "../../utils/prisma";

export const teamResolvers = {
  Query: {
    teams: async (_: any, { tournamentId }: { tournamentId: string }) => {
      const teams = await prisma.team.findMany({
        where: { tournamentId },
        include: {
          captain: true,
          members: {
            include: {
              participant: true,
            },
          },
        },
      });

      return teams.map((team) => ({
        ...team,
        createdAt:
          team.createdAt instanceof Date
            ? team.createdAt.toISOString()
            : team.createdAt,
        members: team.members.map((member) => ({
          ...member.participant,
          createdAt:
            member.participant.createdAt instanceof Date
              ? member.participant.createdAt.toISOString()
              : member.participant.createdAt,
        })),
      }));
    },
  },
  Mutation: {
    startDraft: async (
      _: any,
      { input }: { input: { tournamentId: string } }
    ) => {
      const { tournamentId } = input;

      // 既にチームが作成されているか確認
      const existingTeams = await prisma.team.findMany({
        where: { tournamentId },
      });

      if (existingTeams.length > 0) {
        throw new Error("この大会ではすでにドラフトが開始されています");
      }

      // キャプテン（主将）を取得
      const captainParticipations = await prisma.tournamentParticipant.findMany(
        {
          where: {
            tournamentId,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      if (captainParticipations.length === 0) {
        throw new Error(
          "この大会にはキャプテンが登録されていません。まずはキャプテンを設定してください"
        );
      }

      // ドラフトステータスを作成（一人目一回目の設定）
      await prisma.draftStatus.create({
        data: {
          tournamentId,
          round: 1, // 1回目
          turn: 1, // 1人目
          isActive: true,
        },
      });

      // 各キャプテンにチームを作成（キャプテンだけをメンバーとして追加）
      const createdTeams = [];

      for (const captainParticipation of captainParticipations) {
        const teamName = `${captainParticipation.participant.name}のチーム`;

        // チームを作成
        const team = await prisma.team.create({
          data: {
            name: teamName,
            tournamentId,
            captainId: captainParticipation.participant.id,
          },
          include: {
            captain: true,
          },
        });

        // キャプテン自身をチームメンバーに追加
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            participantId: captainParticipation.participant.id,
          },
        });

        // 作成したチームの情報をフォーマットして配列に追加
        createdTeams.push({
          ...team,
          createdAt: team.createdAt.toISOString(),
          members: [
            {
              ...team.captain,
              createdAt: team.captain.createdAt.toISOString(),
            },
          ],
        });
      }

      // 残りのメンバーはチームに割り振らずに終了
      return createdTeams;
    },
  },
  Team: {
    captain: async (parent: any) => {
      if (parent.captain) {
        return {
          ...parent.captain,
          createdAt:
            parent.captain.createdAt instanceof Date
              ? parent.captain.createdAt.toISOString()
              : parent.captain.createdAt,
        };
      }

      const team = await prisma.team.findUnique({
        where: { id: parent.id },
        include: { captain: true },
      });

      if (!team || !team.captain) return null;

      return {
        ...team.captain,
        createdAt:
          team.captain.createdAt instanceof Date
            ? team.captain.createdAt.toISOString()
            : team.captain.createdAt,
      };
    },

    members: async (parent: any) => {
      if (parent.members) {
        return parent.members;
      }

      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: parent.id },
        include: { participant: true },
      });

      return teamMembers.map((tm) => ({
        ...tm.participant,
        createdAt:
          tm.participant.createdAt instanceof Date
            ? tm.participant.createdAt.toISOString()
            : tm.participant.createdAt,
      }));
    },

    tournament: async (parent: any) => {
      if (parent.tournament) {
        return {
          ...parent.tournament,
          createdAt:
            parent.tournament.createdAt instanceof Date
              ? parent.tournament.createdAt.toISOString()
              : parent.tournament.createdAt,
        };
      }

      const team = await prisma.team.findUnique({
        where: { id: parent.id },
        include: { tournament: true },
      });

      if (!team || !team.tournament) return null;

      return {
        ...team.tournament,
        createdAt:
          team.tournament.createdAt instanceof Date
            ? team.tournament.createdAt.toISOString()
            : team.tournament.createdAt,
      };
    },
  },
};
