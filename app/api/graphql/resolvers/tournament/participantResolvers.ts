// filepath: /workspace/app/api/graphql/resolvers/tournament/participantResolvers.ts
import prisma from "../../utils/prisma";

export const participantResolvers = {
  Query: {
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
  },
  Mutation: {
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
    nominatedBy: async (parent: any) => {
      const drafts = await prisma.draft.findMany({
        where: { participantId: parent.id },
        include: {
          captain: true,
          tournament: true,
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
        tournament: {
          ...draft.tournament,
          createdAt:
            draft.tournament.createdAt instanceof Date
              ? draft.tournament.createdAt.toISOString()
              : draft.tournament.createdAt,
        },
      }));
    },
  },
};
