import { ParticipantId } from '../../core/domain/valueObjects/ParticipantId';
import { TournamentId } from '../../core/domain/valueObjects/TournamentId';
import { prisma } from '../../core/infrastructure/persistence/prisma/client';
import { PrismaParticipantRepository } from '../../core/infrastructure/repositories/PrismaParticipantRepository';
import { PrismaTeamRepository } from '../../core/infrastructure/repositories/PrismaTeamRepository';

// リポジトリの初期化
const teamRepository = new PrismaTeamRepository();
const participantRepository = new PrismaParticipantRepository();

// 型定義
type Context = Record<string, unknown>;

// 参加者の型定義
interface ParticipantType {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: Date | string;
}

// チームの基本型
interface TeamType {
  id: string;
  name: string;
  captainId: string;
  createdAt: Date | string;
  members?: ParticipantType[];
  captain?: ParticipantType;
}

// 入力型
interface CreateTeamInput {
  name: string;
  captainId: string;
  tournamentId: string;
}

export const teamResolvers = {
  Query: {
    // トーナメントのチーム一覧を取得
    teams: async (_: Context, { tournamentId }: { tournamentId: string }) => {
      try {
        const teams = await teamRepository.findByTournamentId(new TournamentId(tournamentId));
        return teams.map((t) => ({
          id: t.id.value,
          name: t.name,
          captainId: t.captainId.value,
          createdAt: new Date().toISOString(), // チームの作成日時情報がない場合
          memberIds: t.memberIds.map((id) => id.value),
        }));
      } catch (error) {
        console.error('チーム一覧取得エラー:', error);
        throw new Error('チーム一覧の取得に失敗しました');
      }
    },
  },
  Mutation: {
    // 新しいチームを作成
    createTeam: async (_: Context, { input }: { input: CreateTeamInput }) => {
      try {
        // 仮実装（実際にはユースケースを呼び出す）
        const { name, captainId, tournamentId } = input;

        const team = await prisma.team.create({
          data: {
            name,
            captainId,
            tournamentId,
            createdAt: new Date(),
          },
          include: {
            captain: true,
          },
        });

        // チームメンバーとしてキャプテンを追加
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            participantId: captainId,
            createdAt: new Date(),
          },
        });

        // キャプテンフラグを設定
        await prisma.tournamentParticipant.updateMany({
          where: {
            tournamentId,
            participantId: captainId,
          },
          data: {
            isCaptain: true,
            teamId: team.id,
          },
        });

        return {
          id: team.id,
          name: team.name,
          captainId: team.captainId,
          createdAt: team.createdAt.toISOString(),
          members: [
            {
              id: team.captain.id,
              name: team.captain.name,
              weapon: team.captain.weapon,
              xp: team.captain.xp,
              createdAt: team.captain.createdAt.toISOString(),
              isCaptain: true,
            },
          ],
        };
      } catch (error) {
        console.error('チーム作成エラー:', error);
        throw new Error('チームの作成に失敗しました');
      }
    },
  },
  Team: {
    // キャプテン情報を取得
    captain: async (parent: TeamType) => {
      try {
        if (parent.captain) return parent.captain;

        const participant = await participantRepository.findById(
          new ParticipantId(parent.captainId)
        );

        if (!participant) return null;

        return {
          id: participant.id.value,
          name: participant.name,
          weapon: participant.weapon,
          xp: participant.xp,
          createdAt: participant.createdAt.toISOString(),
          isCaptain: true,
        };
      } catch (error) {
        console.error('チームキャプテン取得エラー:', error);
        return null;
      }
    },

    // メンバー情報を取得
    members: async (parent: TeamType) => {
      try {
        if (parent.members) return parent.members;

        const teamMembers = await prisma.teamMember.findMany({
          where: { teamId: parent.id },
          include: { participant: true },
        });

        return teamMembers.map((tm) => ({
          id: tm.participant.id,
          name: tm.participant.name,
          weapon: tm.participant.weapon,
          xp: tm.participant.xp,
          createdAt:
            tm.participant.createdAt instanceof Date
              ? tm.participant.createdAt.toISOString()
              : tm.participant.createdAt,
          isCaptain: tm.participant.id === parent.captainId,
        }));
      } catch (error) {
        console.error('チームメンバー取得エラー:', error);
        return []; // エラー時は空の配列を返す
      }
    },
  },
};
