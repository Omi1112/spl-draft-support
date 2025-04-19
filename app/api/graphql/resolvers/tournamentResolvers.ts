// 必要なDIコンテナとユースケースのインポート
import { container } from '@/app/api/core/application/config/container';
import { CreateTournamentUseCase } from '@/app/api/core/application/usecases/tournament/CreateTournamentUseCase';
import { GetTournamentsUseCase } from '@/app/api/core/application/usecases/tournament/GetTournamentsUseCase';
import { TournamentMapper } from '@/app/api/core/application/mappers/TournamentMapper';
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
    // 参加者リストを取得するリゾルバー
    // 注: 実際のデータ取得はスキーマ定義時に選択されたフィールドのみ
    participants: async (parent: { id: string }) => {
      // 現在の実装では親がすでに参加者情報を持っているか、または
      // 参加者情報を取得するためのユースケースがない場合は空配列を返す
      // 将来的には参加者取得のユースケースを追加することが望ましい
      return [];
    },
    
    // チームリストを取得するリゾルバー
    teams: async (parent: { id: string }) => {
      // 現在の実装ではチーム情報を取得するユースケースが実装されていない
      // 将来的にはチーム取得のユースケースを追加することが望ましい
      return [];
    },
    
    // ドラフト状態を取得するリゾルバー
    draftStatus: async (parent: { id: string, draftStatus?: { round: number, turn: number, isActive: boolean } }) => {
      // 親オブジェクトからドラフト状態情報を返す
      // 親がドラフト状態情報を持っている場合はそれを返し、持っていない場合はnullを返す
      if (!parent.draftStatus) return null;
      
      return {
        round: parent.draftStatus.round,
        turn: parent.draftStatus.turn,
        status: parent.draftStatus.isActive ? 'active' : 'inactive'
      };
    },
    
    // ドラフト履歴を取得するリゾルバー
    drafts: async (parent: { id: string }) => {
      // 現在の実装ではドラフト履歴を取得するユースケースが実装されていない
      // 将来的にはドラフト履歴取得のユースケースを追加することが望ましい
      return [];
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
