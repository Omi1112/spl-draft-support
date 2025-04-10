import { GetTournamentUseCase } from '../../../core/application/useCases/tournament/GetTournamentUseCase';
import { GetTournamentsUseCase } from '../../../core/application/useCases/tournament/GetTournamentsUseCase';
import { CreateTournamentUseCase } from '../../../core/application/useCases/tournament/CreateTournamentUseCase';
import { PrismaTournamentRepository } from '../../../core/infrastructure/repositories/PrismaTournamentRepository';
import { CreateTournamentDTO } from '../../../core/application/interfaces/DTOs';

// リポジトリの初期化
const tournamentRepository = new PrismaTournamentRepository();

// ユースケースの初期化
const getTournamentsUseCase = new GetTournamentsUseCase(tournamentRepository);
const getTournamentUseCase = new GetTournamentUseCase(tournamentRepository);
const createTournamentUseCase = new CreateTournamentUseCase(tournamentRepository);

// 型定義
type Context = Record<string, unknown>;
interface TournamentType {
  id: string;
  name: string;
  createdAt: Date | string;
  participants?: any[];
  teams?: any[];
  draftStatus?: any;
}

interface Participant {
  id: { value: string } | string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: { toISOString: () => string } | string;
  isCaptain: boolean;
}

interface Team {
  id: { value: string } | string;
  name: string;
  captainId: { value: string } | string;
  createdAt?: Date | string;
}

// 型ガード関数
const hasValueProperty = (obj: any): obj is { value: string } => {
  return obj && typeof obj === 'object' && 'value' in obj;
};

const hasToISOStringMethod = (obj: any): obj is { toISOString: () => string } => {
  return obj && typeof obj === 'object' && typeof obj.toISOString === 'function';
};

// IDの取得を統一するヘルパー関数
const extractId = (id: { value: string } | string): string => {
  return hasValueProperty(id) ? id.value : (id as string);
};

// 日付の取得を統一するヘルパー関数
const extractDate = (date: Date | { toISOString: () => string } | string): string => {
  if (hasToISOStringMethod(date)) {
    return date.toISOString();
  }
  return date as string;
};

export const tournamentResolvers = {
  Query: {
    // トーナメント一覧を取得
    tournaments: async () => {
      try {
        const tournaments = await getTournamentsUseCase.execute();
        return tournaments.map((t) => ({
          id: extractId(t.id),
          name: t.name,
          createdAt: extractDate(t.createdAt),
        }));
      } catch (error) {
        console.error('トーナメント一覧取得エラー:', error);
        throw new Error(
          `トーナメント一覧の取得に失敗しました: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },

    // 特定のトーナメントを取得
    tournament: async (_: any, { id }: { id: string }) => {
      try {
        const tournament = await getTournamentUseCase.execute(id);
        if (!tournament) return null;

        return {
          id: extractId(tournament.id),
          name: tournament.name,
          createdAt: extractDate(tournament.createdAt),
          participants: tournament.participants?.map((p: Participant) => ({
            id: extractId(p.id),
            name: p.name,
            weapon: p.weapon,
            xp: p.xp,
            createdAt: extractDate(p.createdAt),
            isCaptain: p.isCaptain,
          })),
          teams: tournament.teams?.map((t: Team) => ({
            id: extractId(t.id),
            name: t.name,
            captainId: extractId(t.captainId),
            createdAt: t.createdAt ? extractDate(t.createdAt) : new Date().toISOString(),
          })),
          draftStatus: tournament.draftStatus
            ? {
                round: tournament.draftStatus.round,
                turn: tournament.draftStatus.turn,
                status: tournament.draftStatus.status,
              }
            : null,
        };
      } catch (error) {
        console.error('トーナメント取得エラー:', error);
        throw new Error(
          `トーナメントの取得に失敗しました: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },
  },
  Mutation: {
    // 新しいトーナメントを作成
    createTournament: async (_: Context, { input }: { input: { name: string } }) => {
      try {
        // CreateTournamentDTOを作成
        const dto: CreateTournamentDTO = { name: input.name };
        const tournament = await createTournamentUseCase.execute(dto);
        return {
          id: extractId(tournament.id),
          name: tournament.name,
          createdAt: extractDate(tournament.createdAt),
        };
      } catch (error) {
        console.error('トーナメント作成エラー:', error);
        throw new Error(
          `トーナメントの作成に失敗しました: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },
  },
  Tournament: {
    participants: async (parent: TournamentType) => {
      // すでに取得済みの場合はそれを返す
      if (parent.participants) return parent.participants;

      // 必要に応じてここで参加者を取得するロジックを追加
      return [];
    },
    teams: async (parent: TournamentType) => {
      // すでに取得済みの場合はそれを返す
      if (parent.teams) return parent.teams;

      // 必要に応じてここでチームを取得するロジックを追加
      return [];
    },
    draftStatus: async (parent: TournamentType) => {
      // すでに取得済みの場合はそれを返す
      if (parent.draftStatus) return parent.draftStatus;

      // 必要に応じてここでドラフトステータスを取得するロジックを追加
      return null;
    },
  },
};
