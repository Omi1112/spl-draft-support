// 必要なDIコンテナとユースケースのインポート
import { container } from '@/app/api/core/application/config/container';
import { DraftStatusDto } from '@/app/api/core/application/dto/DraftStatusDto';
import { TournamentMapper } from '@/app/api/core/application/mappers/TournamentMapper';
import { CreateTournamentUseCase } from '@/app/api/core/application/usecases/tournament/CreateTournamentUseCase';
import { GetTournamentsUseCase } from '@/app/api/core/application/usecases/tournament/GetTournamentsUseCase';
import { TournamentRepository } from '@/app/api/core/domain/repositories/TournamentRepository';
import { PrismaTournamentRepository } from '@/app/api/core/infrastructure/repositories/PrismaTournamentRepository';
import { GraphQLErrorUtil } from '@/app/api/graphql/utils/errorUtil';

// GraphQL Context型定義
type Context = Record<string, unknown>;

// DIコンテナの初期化
container.registerSingleton<TournamentRepository>(
  'TournamentRepository',
  PrismaTournamentRepository
);

// ユースケースのインスタンスを取得
const createTournamentUseCase = container.resolve(CreateTournamentUseCase);
const getTournamentsUseCase = container.resolve(GetTournamentsUseCase);

// Tournament型のリゾルバー定義
export const tournamentResolvers = {
  // Tournamentオブジェクト型のリゾルバー
  Tournament: {
    // ドラフト状態を取得するリゾルバー
    draftStatus: async (parent: {
      id: string;
      draftStatus?: DraftStatusDto;
    }): Promise<DraftStatusDto | null> => {
      if (!parent.draftStatus) return null;
      // TODO: 仮実装のため空配列を返却
      return {
        round: parent.draftStatus.round,
        turn: parent.draftStatus.turn,
        isActive: parent.draftStatus.isActive,
      };
    },
  },

  Query: {
    // トーナメント一覧を取得
    tournaments: async () => {
      try {
        // GetTournamentsUseCaseを使用してすべての大会を取得
        const tournaments = await getTournamentsUseCase.execute();

        // ドメインモデルからDTOに変換して返却
        return tournaments.map((tournament) => TournamentMapper.toDto(tournament));
      } catch (error) {
        // エラーハンドリング
        throw GraphQLErrorUtil.formatError(
          error instanceof Error ? error : new Error('トーナメント一覧の取得に失敗しました')
        );
      }
    },
  },
  Mutation: {
    // 新しいトーナメントを作成
    createTournament: async (_: Context, { input }: { input: { name: string } }) => {
      try {
        // CreateTournamentUseCaseを直接使用して大会を作成
        const createTournamentDto = {
          name: input.name,
        };

        // ユースケースを実行
        const createdTournament = await createTournamentUseCase.execute(createTournamentDto);

        // ドメインモデルからDTOに変換して返却
        return TournamentMapper.toDto(createdTournament);
      } catch (error) {
        // エラーハンドリング - GraphQLErrorUtilを使用してGraphQLエラー形式に変換
        throw GraphQLErrorUtil.formatError(
          error instanceof Error ? error : new Error('Unknown error')
        );
      }
    },
  },
};
