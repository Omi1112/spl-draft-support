import { GetDraftsUseCase } from '../../core/application/useCases/draft/GetDraftsUseCase';
import { NominateParticipantUseCase } from '../../core/application/useCases/draft/NominateParticipantUseCase';
import { ResetDraftUseCase } from '../../core/application/useCases/draft/ResetDraftUseCase';
import { StartDraftUseCase } from '../../core/application/useCases/draft/StartDraftUseCase';
import { DraftDomainService } from '../../core/domain/services/DraftDomainService';
import { prisma } from '../../core/infrastructure/persistence/prisma/client';
import { PrismaDraftRepository } from '../../core/infrastructure/repositories/PrismaDraftRepository';
import { PrismaTeamRepository } from '../../core/infrastructure/repositories/PrismaTeamRepository';
import { PrismaTournamentParticipantRepository } from '../../core/infrastructure/repositories/PrismaTournamentParticipantRepository';
import { PrismaTournamentRepository } from '../../core/infrastructure/repositories/PrismaTournamentRepository';

// リポジトリの初期化
const draftRepository = new PrismaDraftRepository();
const teamRepository = new PrismaTeamRepository();
const tournamentParticipantRepository = new PrismaTournamentParticipantRepository();
const tournamentRepository = new PrismaTournamentRepository();

// ドメインサービスの初期化
const draftDomainService = new DraftDomainService(
  draftRepository,
  teamRepository,
  tournamentParticipantRepository,
  tournamentRepository
);

// ユースケースの初期化
const getDraftsUseCase = new GetDraftsUseCase(draftRepository);
const resetDraftUseCase = new ResetDraftUseCase(draftDomainService);
const startDraftUseCase = new StartDraftUseCase(draftDomainService);
const nominateParticipantUseCase = new NominateParticipantUseCase(draftRepository);

// 型定義
type Context = Record<string, unknown>;

// 入力型
interface UpdateDraftStatusInput {
  tournamentId: string;
  round: number;
  turn: number;
  status: string;
}

// リセットドラフト用の入力型
interface ResetDraftInput {
  tournamentId: string;
}

// ドラフト開始用の入力型
interface StartDraftInput {
  tournamentId: string;
}

// 参加者指名用の入力型
interface NominateParticipantInput {
  tournamentId: string;
  captainId: string;
  participantId: string;
}

export const draftResolvers = {
  Query: {
    // トーナメントのドラフト一覧を取得（オプションのcaptainIdでフィルタリング可能）
    drafts: async (
      _: Context,
      { tournamentId, captainId }: { tournamentId: string; captainId?: string }
    ) => {
      try {
        // キャプテンIDの有無によって呼び出すユースケースのメソッドを変える
        let drafts;
        if (captainId) {
          drafts = await getDraftsUseCase.executeByTournamentAndCaptain(tournamentId, captainId);
        } else {
          drafts = await getDraftsUseCase.executeByTournamentId(tournamentId);
        }

        return drafts;
      } catch (error) {
        console.error('ドラフト一覧取得エラー:', error);
        throw new Error('ドラフト一覧の取得に失敗しました');
      }
    },
  },
  Mutation: {
    // ドラフトステータスの更新
    // UpdateDraftStatusUseCaseを実装することが望ましいですが、今回はリファクタリングの範囲外とします
    updateDraftStatus: async (_: Context, { input }: { input: UpdateDraftStatusInput }) => {
      try {
        const { tournamentId, round, turn, status } = input;
        const isActive = status === 'in_progress';

        // このメソッドは別途リファクタリングが必要ですが、今回は直接Prismaを使用する実装のままとします
        const draftStatus = await prisma.draftStatus.upsert({
          where: { tournamentId },
          update: {
            round,
            turn,
            isActive,
          },
          create: {
            tournamentId,
            round,
            turn,
            isActive,
          },
        });

        return {
          round: draftStatus.round,
          turn: draftStatus.turn,
          status: draftStatus.isActive ? 'in_progress' : 'completed',
        };
      } catch (error) {
        console.error('ドラフトステータス更新エラー:', error);
        throw new Error('ドラフトステータスの更新に失敗しました');
      }
    },

    // ドラフトリセット
    resetDraft: async (_: Context, { input }: { input: ResetDraftInput }) => {
      try {
        const { tournamentId } = input;

        // 依存性注入されたResetDraftUseCaseを使用してドラフトをリセット
        const result = await resetDraftUseCase.execute(tournamentId);

        console.log(`トーナメントID ${tournamentId} のドラフトをリセットしました`);
        return result;
      } catch (error) {
        console.error('ドラフトリセットエラー:', error);
        throw new Error('ドラフトのリセットに失敗しました');
      }
    },

    // ドラフト開始
    startDraft: async (_: Context, { input }: { input: StartDraftInput }) => {
      try {
        const { tournamentId } = input;

        // 依存性注入されたStartDraftUseCaseを使用してドラフトを開始
        // 戻り値は不要になった
        await startDraftUseCase.execute(tournamentId);

        console.log(`トーナメントID ${tournamentId} のドラフトを開始しました`);
        // 成功したら true を返す
        return true;
      } catch (error) {
        console.error('ドラフト開始エラー:', error);
        // エラー時は GraphQL がエラーをハンドルする
        throw new Error('ドラフトの開始に失敗しました');
      }
    },

    // 参加者指名
    nominateParticipant: async (_: Context, { input }: { input: NominateParticipantInput }) => {
      try {
        const result = await nominateParticipantUseCase.execute(input);

        console.log(
          `トーナメントID ${input.tournamentId} でキャプテン ${input.captainId} が参加者 ${input.participantId} を指名しました`
        );
        return {
          id: result.id,
          tournamentId: input.tournamentId,
          captainId: input.captainId,
          participantId: input.participantId,
          round: 1, // 実際のラウンド情報はユースケースから取得するべき
          turn: 1, // 実際のターン情報はユースケースから取得するべき
          status: result.status,
          createdAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('参加者指名エラー:', error);
        throw error instanceof Error ? error : new Error('参加者の指名に失敗しました');
      }
    },
  },
};
