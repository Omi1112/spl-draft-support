// filepath: /workspace/app/api/graphql/resolvers/tournament/tournamentResolvers.ts
import prisma from "../../utils/prisma";

export const tournamentResolvers = {
  Query: {
    tournaments: async () => {
      return await prisma.tournament.findMany();
    },
    tournament: async (_: any, { id }: { id: string }) => {
      return await prisma.tournament.findUnique({
        where: { id },
        include: {
          participations: {
            include: {
              participant: true,
            },
          },
        },
      });
    },
  },
  Mutation: {
    createTournament: async (_: any, { input }: { input: any }) => {
      const tournament = await prisma.tournament.create({
        data: {
          name: input.name,
          createdAt: new Date(), // 明示的にcreatedAtを設定
        },
      });

      // ISO文字列形式でcreatedAtを返す
      return {
        ...tournament,
        createdAt: tournament.createdAt.toISOString(),
      };
    },
    resetDraft: async (
      _: any,
      { input }: { input: { tournamentId: string } }
    ) => {
      const { tournamentId } = input;

      try {
        // トランザクションを使用せず、個別の操作として削除を実行
        // 1. この大会に関連する全てのチームと関連メンバーを取得
        const teams = await prisma.team.findMany({
          where: { tournamentId },
          include: { members: true },
        });

        // 2. 各チームのメンバーを削除（外部キー制約のため）
        for (const team of teams) {
          await prisma.teamMember.deleteMany({
            where: { teamId: team.id },
          });
        }

        // 3. 全てのチームを削除
        await prisma.team.deleteMany({
          where: { tournamentId },
        });

        // 4. この大会の指名データを削除
        await prisma.draft.deleteMany({
          where: { tournamentId },
        });

        // 5. ドラフトステータスを削除
        await prisma.draftStatus.deleteMany({
          where: { tournamentId },
        });

        // 6. 参加者のチーム関連付けをリセット
        await prisma.tournamentParticipant.updateMany({
          where: { tournamentId },
          data: { teamId: null },
        });

        return true;
      } catch (error) {
        console.error("ドラフトリセットエラー:", error);
        return false;
      }
    },
  },
  // Tournamentタイプのリゾルバーを追加して日付のフォーマットを保証
  Tournament: {
    createdAt: (parent: any) => {
      // すでに文字列の場合はそのまま返し、Date型の場合はISOString形式に変換
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      return parent.createdAt;
    },
    participants: async (parent: any) => {
      const participations = await prisma.tournamentParticipant.findMany({
        where: { tournamentId: parent.id },
        include: {
          participant: true,
        },
      });

      return participations.map((p) => ({
        ...p.participant,
        createdAt:
          p.participant.createdAt instanceof Date
            ? p.participant.createdAt.toISOString()
            : p.participant.createdAt,
        isCaptain: p.isCaptain,
      }));
    },
    captain: async (parent: any) => {
      const captainParticipation = await prisma.tournamentParticipant.findFirst(
        {
          where: {
            tournamentId: parent.id,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      return captainParticipation
        ? {
            ...captainParticipation.participant,
            createdAt:
              captainParticipation.participant.createdAt instanceof Date
                ? captainParticipation.participant.createdAt.toISOString()
                : captainParticipation.participant.createdAt,
          }
        : null;
    },
    captains: async (parent: any) => {
      const captainParticipations = await prisma.tournamentParticipant.findMany(
        {
          where: {
            tournamentId: parent.id,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      return captainParticipations.map((p) => ({
        ...p.participant,
        createdAt:
          p.participant.createdAt instanceof Date
            ? p.participant.createdAt.toISOString()
            : p.participant.createdAt,
      }));
    },
    teams: async (parent: any) => {
      const teams = await prisma.team.findMany({
        where: { tournamentId: parent.id },
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
    drafts: async (parent: any) => {
      const drafts = await prisma.draft.findMany({
        where: { tournamentId: parent.id },
        include: {
          captain: true,
          participant: true,
        },
      });

      return drafts.map((draft) => ({
        ...draft,
        createdAt:
          draft.createdAt instanceof Date
            ? draft.createdAt.toISOString()
            : draft.createdAt,
        captain: {
          ...draft.captain,
          createdAt:
            draft.captain.createdAt instanceof Date
              ? draft.captain.createdAt.toISOString()
              : draft.captain.createdAt,
        },
        participant: {
          ...draft.participant,
          createdAt:
            draft.participant.createdAt instanceof Date
              ? draft.participant.createdAt.toISOString()
              : draft.participant.createdAt,
        },
      }));
    },
    // トーナメントとドラフトステータスのリレーションを解決
    draftStatus: async (parent: any) => {
      const status = await prisma.draftStatus.findUnique({
        where: { tournamentId: parent.id },
      });

      if (!status) return null;

      return {
        ...status,
        createdAt:
          status.createdAt instanceof Date
            ? status.createdAt.toISOString()
            : status.createdAt,
        updatedAt:
          status.updatedAt instanceof Date
            ? status.updatedAt.toISOString()
            : status.updatedAt,
      };
    },
  },
};
