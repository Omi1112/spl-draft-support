import { GetTournamentUseCase } from '../../core/application/useCases/tournament/GetTournamentUseCase';
import { GetTournamentsUseCase } from '../../core/application/useCases/tournament/GetTournamentsUseCase';
import { CreateTournamentUseCase } from '../../core/application/useCases/tournament/CreateTournamentUseCase';
import { GetTournamentParticipantsByTournamentIdUseCase } from '../../core/application/useCases/tournament/GetTournamentParticipantsByTournamentIdUseCase';
import { GetTeamsByTournamentIdUseCase } from '../../core/application/useCases/team/GetTeamsByTournamentIdUseCase';
import { PrismaTournamentRepository } from '../../core/infrastructure/repositories/PrismaTournamentRepository';
import { PrismaParticipantRepository } from '../../core/infrastructure/repositories/PrismaParticipantRepository';
import { PrismaTeamRepository } from '../../core/infrastructure/repositories/PrismaTeamRepository';
import { PrismaTournamentParticipantRepository } from '../../core/infrastructure/repositories/PrismaTournamentParticipantRepository';
import { CreateTournamentDTO } from '../../core/application/interfaces/DTOs';

// リポジトリの初期化
const tournamentRepository = new PrismaTournamentRepository();
const participantRepository = new PrismaParticipantRepository();
const teamRepository = new PrismaTeamRepository();
const tournamentParticipantRepository = new PrismaTournamentParticipantRepository();

// ユースケースの初期化
const getTournamentsUseCase = new GetTournamentsUseCase(tournamentRepository);
const getTournamentUseCase = new GetTournamentUseCase(
  tournamentRepository,
  participantRepository,
  teamRepository
);
const createTournamentUseCase = new CreateTournamentUseCase(tournamentRepository);
const getTournamentParticipantsByTournamentIdUseCase =
  new GetTournamentParticipantsByTournamentIdUseCase(
    tournamentParticipantRepository,
    participantRepository
  );
const getTeamsByTournamentIdUseCase = new GetTeamsByTournamentIdUseCase(teamRepository);

// 型定義
type Context = Record<string, unknown>;
interface TournamentType {
  id: string;
  name: string;
  createdAt: Date | string;
  participants?: Participant[];
  teams?: TeamType[];
  draftStatus?: DraftStatusType;
}

interface TeamType {
  id: string;
  name: string;
  captainId: string;
  createdAt: Date | string;
  members?: Participant[];
  captain?: Participant;
}

interface DraftStatusType {
  tournamentId: string;
  round: number;
  turn: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
const hasValueProperty = (obj: unknown): obj is { value: string } => {
  return obj !== null && typeof obj === 'object' && 'value' in obj;
};

const hasToISOStringMethod = (obj: unknown): obj is { toISOString: () => string } => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'toISOString' in obj &&
    typeof (obj as { toISOString: unknown }).toISOString === 'function'
  );
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
    tournament: async (_: Context, { id }: { id: string }) => {
      try {
        const tournament = await getTournamentUseCase.execute(id);
        if (!tournament) return null;

        return {
          id: extractId(tournament.id),
          name: tournament.name,
          createdAt: extractDate(tournament.createdAt),
          draftStatus: tournament.draftStatus,
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
    tournamentParticipants: async (parent: TournamentType) => {
      try {
        // すでに取得済みの場合はそれを返す
        if (parent.participants) return parent.participants;

        // ユースケースを使用してトーナメント参加者を取得
        const tournamentParticipants = await getTournamentParticipantsByTournamentIdUseCase.execute(
          parent.id
        );

        // トーナメント参加者が見つからない場合は空配列を返す
        if (!tournamentParticipants || tournamentParticipants.length === 0) {
          return [];
        }

        // GraphQLスキーマに合わせた形式に変換
        return tournamentParticipants
          .map((tp) => {
            if (!tp.participant) return null;

            return {
              Tournament: {
                id: tp.tournamentId,
                name: parent.name,
                createdAt: parent.createdAt,
              },
              Participant: {
                id: tp.participant.id,
                name: tp.participant.name,
                weapon: tp.participant.weapon,
                xp: tp.participant.xp,
                createdAt: tp.participant.createdAt,
              },
              isCaptain: tp.isCaptain,
              createdAt: tp.createdAt,
            };
          })
          .filter((item) => item !== null);
      } catch (error) {
        console.error('トーナメント参加者取得エラー:', error);
        throw new Error(
          `トーナメント参加者の取得に失敗しました: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },
    teams: async (parent: TournamentType) => {
      try {
        // すでに取得済みの場合はそれを返す
        if (parent.teams) return parent.teams;

        // ユースケースを使用してトーナメントIDに基づくチームを取得
        const teams = await getTeamsByTournamentIdUseCase.execute(parent.id);

        // チームが見つからない場合は空配列を返す
        if (!teams || teams.length === 0) {
          return [];
        }

        // GraphQLスキーマに合わせた形式に変換
        return teams.map((team) => ({
          id: extractId(team.id),
          name: team.name,
          captainId: extractId(team.captainId),
          createdAt: extractDate(team.createdAt),
        }));
      } catch (error) {
        console.error('チーム取得エラー:', error);
        throw new Error(
          `チームの取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },
    draftStatus: async (parent: TournamentType) => {
      // すでに取得済みの場合はそれを返す
      if (parent.draftStatus) return parent.draftStatus;

      // 必要に応じてここでドラフトステータスを取得するロジックを追加
      return null;
    },
  },
};
