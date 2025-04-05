import prisma from "../utils/prisma";

export const resolvers = {
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
    participants: async (
      _: any,
      { tournamentId }: { tournamentId: string }
    ) => {
      const participations = await prisma.tournamentParticipant.findMany({
        where: { tournamentId },
        include: {
          participant: true,
        },
      });

      return participations.map((p) => ({
        ...p.participant,
        isCaptain: p.isCaptain,
      }));
    },
    allParticipants: async () => {
      return await prisma.participant.findMany();
    },
    tournamentCaptain: async (
      _: any,
      { tournamentId }: { tournamentId: string }
    ) => {
      const captainParticipation = await prisma.tournamentParticipant.findFirst(
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

      return captainParticipation ? captainParticipation.participant : null;
    },
    tournamentCaptains: async (
      _: any,
      { tournamentId }: { tournamentId: string }
    ) => {
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

      return captainParticipations.map((p) => ({
        ...p.participant,
        createdAt:
          p.participant.createdAt instanceof Date
            ? p.participant.createdAt.toISOString()
            : p.participant.createdAt,
      }));
    },
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
    createParticipant: async (_: any, { input }: { input: any }) => {
      const participant = await prisma.participant.create({
        data: {
          name: input.name,
          weapon: input.weapon,
          xp: parseInt(input.xp, 10),
          createdAt: new Date(),
        },
      });

      return {
        ...participant,
        createdAt: participant.createdAt.toISOString(),
      };
    },
    addParticipantToTournament: async (_: any, { input }: { input: any }) => {
      let participantId = input.participantId;

      // 参加者IDが指定されていない場合は、新しい参加者を作成
      if (!participantId && input.participant) {
        const newParticipant = await prisma.participant.create({
          data: {
            name: input.participant.name,
            weapon: input.participant.weapon,
            xp: parseInt(input.participant.xp, 10),
            createdAt: new Date(),
          },
        });
        participantId = newParticipant.id;
      }

      if (!participantId) {
        throw new Error("参加者IDまたは参加者情報が必要です");
      }

      // 中間テーブルにレコードを作成
      const tournamentParticipant = await prisma.tournamentParticipant.create({
        data: {
          tournamentId: input.tournamentId,
          participantId,
          createdAt: new Date(),
        },
        include: {
          participant: true,
          tournament: true,
        },
      });

      return {
        ...tournamentParticipant,
        createdAt: tournamentParticipant.createdAt.toISOString(),
      };
    },
    setCaptain: async (_: any, { input }: { input: any }) => {
      const { tournamentId, participantId } = input;

      // 現在のキャプテン状態を確認
      const currentParticipation =
        await prisma.tournamentParticipant.findUnique({
          where: {
            tournamentId_participantId: {
              tournamentId,
              participantId,
            },
          },
        });

      // 同じ参加者が既にキャプテンの場合は、キャプテンを解除する
      if (currentParticipation && currentParticipation.isCaptain) {
        const updatedParticipation = await prisma.tournamentParticipant.update({
          where: {
            id: currentParticipation.id,
          },
          data: {
            isCaptain: false,
          },
          include: {
            participant: true,
            tournament: true,
          },
        });

        return {
          ...updatedParticipation,
          createdAt: updatedParticipation.createdAt.toISOString(),
        };
      }

      // キャプテンを追加
      const updatedParticipation = await prisma.tournamentParticipant.update({
        where: {
          tournamentId_participantId: {
            tournamentId,
            participantId,
          },
        },
        data: {
          isCaptain: true,
        },
        include: {
          participant: true,
          tournament: true,
        },
      });

      return {
        ...updatedParticipation,
        createdAt: updatedParticipation.createdAt.toISOString(),
      };
    },
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
    resetDraft: async (
      _: any,
      { input }: { input: { tournamentId: string } }
    ) => {
      const { tournamentId } = input;

      try {
        // 1. この大会に関連する全てのチームを取得
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
  },
  Participant: {
    createdAt: (parent: any) => {
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      return parent.createdAt;
    },
    tournaments: async (parent: any) => {
      const participations = await prisma.tournamentParticipant.findMany({
        where: { participantId: parent.id },
        include: {
          tournament: true,
        },
      });

      return participations.map((p) => ({
        ...p.tournament,
        createdAt:
          p.tournament.createdAt instanceof Date
            ? p.tournament.createdAt.toISOString()
            : p.tournament.createdAt,
      }));
    },
    isCaptainOf: async (parent: any) => {
      const captainParticipations = await prisma.tournamentParticipant.findMany(
        {
          where: {
            participantId: parent.id,
            isCaptain: true,
          },
          include: {
            tournament: true,
          },
        }
      );

      return captainParticipations.map((p) => ({
        ...p.tournament,
        createdAt:
          p.tournament.createdAt instanceof Date
            ? p.tournament.createdAt.toISOString()
            : p.tournament.createdAt,
      }));
    },
    team: async (parent: any) => {
      const teamMember = await prisma.teamMember.findFirst({
        where: { participantId: parent.id },
        include: { team: true },
      });

      if (!teamMember) return null;

      return {
        ...teamMember.team,
        createdAt:
          teamMember.team.createdAt instanceof Date
            ? teamMember.team.createdAt.toISOString()
            : teamMember.team.createdAt,
      };
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
