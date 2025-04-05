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
    tournamentCaptain: async (_: any, { tournamentId }: { tournamentId: string }) => {
      const captainParticipation = await prisma.tournamentParticipant.findFirst({
        where: { 
          tournamentId,
          isCaptain: true
        },
        include: {
          participant: true
        }
      });
      
      return captainParticipation ? captainParticipation.participant : null;
    }
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
      const currentParticipation = await prisma.tournamentParticipant.findUnique({
        where: {
          tournamentId_participantId: {
            tournamentId,
            participantId
          }
        }
      });
      
      // 同じ参加者が既にキャプテンの場合は、キャプテンを解除する
      if (currentParticipation && currentParticipation.isCaptain) {
        const updatedParticipation = await prisma.tournamentParticipant.update({
          where: {
            id: currentParticipation.id
          },
          data: {
            isCaptain: false
          },
          include: {
            participant: true,
            tournament: true
          }
        });
        
        return {
          ...updatedParticipation,
          createdAt: updatedParticipation.createdAt.toISOString()
        };
      }
      
      // キャプテンを追加
      const updatedParticipation = await prisma.tournamentParticipant.update({
        where: {
          tournamentId_participantId: {
            tournamentId,
            participantId,
          }
        },
        data: {
          isCaptain: true,
        },
        include: {
          participant: true,
          tournament: true
        }
      });
      
      return {
        ...updatedParticipation,
        createdAt: updatedParticipation.createdAt.toISOString()
      };
    }
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
      const captainParticipation = await prisma.tournamentParticipant.findFirst({
        where: { 
          tournamentId: parent.id,
          isCaptain: true
        },
        include: {
          participant: true
        }
      });
      
      return captainParticipation ? {
        ...captainParticipation.participant,
        createdAt: captainParticipation.participant.createdAt instanceof Date 
          ? captainParticipation.participant.createdAt.toISOString() 
          : captainParticipation.participant.createdAt
      } : null;
    },
    captains: async (parent: any) => {
      const captainParticipations = await prisma.tournamentParticipant.findMany({
        where: { 
          tournamentId: parent.id,
          isCaptain: true
        },
        include: {
          participant: true
        }
      });
      
      return captainParticipations.map(p => ({
        ...p.participant,
        createdAt: p.participant.createdAt instanceof Date 
          ? p.participant.createdAt.toISOString() 
          : p.participant.createdAt
      }));
    }
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
      const captainParticipations = await prisma.tournamentParticipant.findMany({
        where: { 
          participantId: parent.id,
          isCaptain: true
        },
        include: {
          tournament: true
        }
      });
      
      return captainParticipations.map(p => ({
        ...p.tournament,
        createdAt: p.tournament.createdAt instanceof Date 
          ? p.tournament.createdAt.toISOString() 
          : p.tournament.createdAt
      }));
    }
  },
};
