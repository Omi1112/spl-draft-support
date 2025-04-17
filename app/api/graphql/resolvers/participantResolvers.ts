import { AddParticipantToTournamentUseCase } from '../../core/application/useCases/participant/AddParticipantToTournamentUseCase';
import { ToggleCaptainUseCase } from '../../core/application/useCases/participant/ToggleCaptainUseCase';
import { TournamentParticipantDomainService } from '../../core/domain/services/TournamentParticipantDomainService';
import { TournamentId } from '../../core/domain/valueObjects/TournamentId';
import { prisma } from '../../core/infrastructure/persistence/prisma/client';
import { PrismaParticipantRepository } from '../../core/infrastructure/repositories/PrismaParticipantRepository';
import { PrismaTournamentParticipantRepository } from '../../core/infrastructure/repositories/PrismaTournamentParticipantRepository';
import { PrismaTournamentRepository } from '../../core/infrastructure/repositories/PrismaTournamentRepository';

// リポジトリの初期化
const participantRepository = new PrismaParticipantRepository();
const tournamentRepository = new PrismaTournamentRepository();
const tournamentParticipantRepository = new PrismaTournamentParticipantRepository();

// ドメインサービスの初期化
const tournamentParticipantDomainService = new TournamentParticipantDomainService(
  tournamentParticipantRepository
);

// ユースケースの初期化
const addParticipantToTournamentUseCase = new AddParticipantToTournamentUseCase(
  tournamentRepository,
  participantRepository,
  tournamentParticipantRepository
);
const toggleCaptainUseCase = new ToggleCaptainUseCase(
  tournamentRepository,
  tournamentParticipantDomainService
);

// 型定義
type Context = Record<string, unknown>;

// 入力型
interface CreateParticipantInput {
  name: string;
  weapon: string;
  xp: number;
  isCaptain?: boolean;
  tournamentId: string;
}

// キャプテン設定・解除のための入力型
interface ToggleCaptainInput {
  tournamentId: string;
  participantId: string;
}

// 標準化されたエラーハンドリング関数
const handleError = (error: unknown, message: string): never => {
  console.error(`${message}:`, error);
  throw new Error(`${message}: ${error instanceof Error ? error.message : '不明なエラー'}`);
};

export const participantResolvers = {
  Query: {
    // トーナメント参加者一覧を取得（未所属かつキャプテンでない参加者のみ返すオプション追加）
    participants: async (
      _parent: Context,
      args: { tournamentId: string; unassignedOnly?: boolean }
    ) => {
      try {
        const participants = await participantRepository.findByTournamentId(
          new TournamentId(args.tournamentId)
        );
        // オプション指定時のみ未所属かつキャプテンでない参加者のみ返す
        // isCaptainはTournamentParticipant経由で判定する必要があるため、ここでは一時的に全員返す
        if (args.unassignedOnly) {
          return participants
            .filter((p) => !p.teamId)
            .map((p) => ({
              id: p.id.value,
              name: p.name,
              weapon: p.weapon,
              xp: p.xp,
              createdAt: p.createdAt.toISOString(),
              team: null,
            }));
        }
        // 既存の全件返却
        return participants.map((p) => ({
          id: p.id.value,
          name: p.name,
          weapon: p.weapon,
          xp: p.xp,
          createdAt: p.createdAt.toISOString(),
          team: p.teamId ? { id: p.teamId.value } : null,
        }));
      } catch (error) {
        return handleError(error, '参加者一覧の取得に失敗しました');
      }
    },

    // 全参加者一覧を取得
    allParticipants: async () => {
      try {
        const participants = await prisma.participant.findMany();
        return participants.map((p) => ({
          ...p,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
          isCaptain: false, // デフォルトはfalse
        }));
      } catch (error) {
        return handleError(error, '全参加者の取得に失敗しました');
      }
    },

    // トーナメントキャプテン取得
    tournamentCaptain: async (_: Context, { tournamentId }: { tournamentId: string }) => {
      try {
        const captains = await participantRepository.findCaptains(new TournamentId(tournamentId));
        if (captains.length === 0) return null;

        const captain = captains[0]; // 最初のキャプテンを返す
        return {
          id: captain.id.value,
          name: captain.name,
          weapon: captain.weapon,
          xp: captain.xp,
          createdAt: captain.createdAt.toISOString(),
          isCaptain: true,
        };
      } catch (error) {
        return handleError(error, 'キャプテンの取得に失敗しました');
      }
    },

    // トーナメントキャプテン一覧取得
    tournamentCaptains: async (_: Context, { tournamentId }: { tournamentId: string }) => {
      try {
        const captains = await participantRepository.findCaptains(new TournamentId(tournamentId));
        return captains.map((c) => ({
          id: c.id.value,
          name: c.name,
          weapon: c.weapon,
          xp: c.xp,
          createdAt: c.createdAt.toISOString(),
          isCaptain: true,
        }));
      } catch (error) {
        return handleError(error, 'キャプテン一覧の取得に失敗しました');
      }
    },

    // 既存のcaptainsクエリ（互換性のため維持）
    captains: async (_: Context, { tournamentId }: { tournamentId: string }) => {
      try {
        const captains = await participantRepository.findCaptains(new TournamentId(tournamentId));
        return captains.map((c) => ({
          id: c.id.value,
          name: c.name,
          weapon: c.weapon,
          xp: c.xp,
          createdAt: c.createdAt.toISOString(),
          isCaptain: true,
        }));
      } catch (error) {
        return handleError(error, 'キャプテン一覧の取得に失敗しました');
      }
    },
  },
  Mutation: {
    // 参加者を追加（TournamentParticipant主軸・Participantネスト型で返却）
    addParticipant: async (_: Context, { input }: { input: CreateParticipantInput }) => {
      try {
        const result = await addParticipantToTournamentUseCase.execute({
          tournamentId: input.tournamentId,
          name: input.name,
          weapon: input.weapon,
          xp: input.xp,
          isCaptain: input.isCaptain || false,
        });
        // TournamentParticipantDTO型でそのまま返却
        return result;
      } catch (error) {
        return handleError(error, '参加者の追加に失敗しました');
      }
    },

    // 参加者をキャプテンに設定/解除するトグル機能
    toggleCaptain: async (_: Context, { input }: { input: ToggleCaptainInput }) => {
      try {
        const result = await toggleCaptainUseCase.execute(input);

        // 処理結果を返す
        return {
          id: result.id,
          tournamentId: result.tournamentId,
          participantId: result.participantId,
          isCaptain: result.isCaptain,
        };
      } catch (error) {
        return handleError(error, 'キャプテンの設定に失敗しました');
      }
    },

    // 廃止予定のsetCaptainミューテーション（toggleCaptainを使用）
    setCaptain: async (_: Context, { input }: { input: ToggleCaptainInput }) => {
      try {
        // toggleCaptainと同じロジックを使用
        const result = await toggleCaptainUseCase.execute(input);

        return {
          id: result.id,
          tournamentId: result.tournamentId,
          participantId: result.participantId,
          isCaptain: result.isCaptain,
        };
      } catch (error) {
        return handleError(error, 'キャプテンの設定に失敗しました');
      }
    },

    // 参加者をトーナメントに追加するミューテーション
    addParticipantToTournament: async (
      _: Context,
      {
        input,
      }: {
        input: {
          tournamentId: string;
          participant: {
            name: string;
            weapon: string;
            xp: number;
            isCaptain?: boolean;
          };
        };
      }
    ) => {
      try {
        // ユースケースを実行して参加者を追加
        const result = await addParticipantToTournamentUseCase.execute({
          tournamentId: input.tournamentId,
          name: input.participant.name,
          weapon: input.participant.weapon,
          xp: input.participant.xp,
          isCaptain: input.participant.isCaptain || false,
        });

        // 返り値はGraphQLスキーマに合わせた形式にする
        return {
          id: result.id,
          tournamentId: result.tournamentId,
          participantId: result.participantId,
          createdAt: result.createdAt,
          isCaptain: (result as { isCaptain: boolean }).isCaptain,
        };
      } catch (error) {
        return handleError(error, 'トーナメントへの参加者追加に失敗しました');
      }
    },
  },
};
