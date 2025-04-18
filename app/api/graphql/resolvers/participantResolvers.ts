import { AddParticipantToTournamentUseCase } from '../../core/application/useCases/participant/AddParticipantToTournamentUseCase';
import { ToggleCaptainUseCase } from '../../core/application/useCases/participant/ToggleCaptainUseCase';
import { TournamentParticipantDomainService } from '../../core/domain/services/TournamentParticipantDomainService';
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
