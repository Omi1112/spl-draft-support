// filepath: /workspace/app/api/graphql/tournament.api.test.ts
import { gql } from 'graphql-tag';
import { executeGraphQL } from './utils/testUtils';
import { GetTournamentsUseCase } from '@/app/api/core/application/usecases/tournament/GetTournamentsUseCase';
import { CreateTournamentUseCase } from '@/app/api/core/application/usecases/tournament/CreateTournamentUseCase';
import { Tournament } from '@/app/api/core/domain/entities/Tournament';

// ユースケースのモック
jest.mock('@/app/api/core/application/usecases/tournament/GetTournamentsUseCase');
jest.mock('@/app/api/core/application/usecases/tournament/CreateTournamentUseCase');

describe('Tournament GraphQL API', () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('クエリ: tournaments', () => {
    // tournamentsクエリのテスト定義
    const TOURNAMENTS_QUERY = gql`
      query {
        tournaments {
          id
          name
          createdAt
        }
      }
    `;

    it('トーナメントの一覧を取得できること', async () => {
      // モックデータの準備
      const mockTournaments = [
        {
          id: { value: '1' },
          nameValue: 'Tournament A',
          createdAt: new Date('2025-04-01T10:00:00Z'),
          draftStatus: null,
        },
        {
          id: { value: '2' },
          nameValue: 'Tournament B',
          createdAt: new Date('2025-04-02T11:00:00Z'),
          draftStatus: null,
        },
      ] as unknown as Tournament[];

      // GetTournamentsUseCaseのモック
      (GetTournamentsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockTournaments);

      // GraphQLクエリの実行
      const result = await executeGraphQL(TOURNAMENTS_QUERY);

      // レスポンスの検証
      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data.tournaments).toHaveLength(2);
      expect(result.data.tournaments).toEqual([
        {
          id: '1',
          name: 'Tournament A',
          createdAt: expect.any(String),
        },
        {
          id: '2',
          name: 'Tournament B',
          createdAt: expect.any(String),
        },
      ]);

      // ユースケースが正しく呼び出されたか検証
      expect(GetTournamentsUseCase.prototype.execute).toHaveBeenCalledTimes(1);
    });

    it('エラーが発生した場合はエラー情報を返すこと', async () => {
      // GetTournamentsUseCaseがエラーを投げるようにモック
      const mockError = new Error('テスト用エラー');
      (GetTournamentsUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);

      // GraphQLクエリの実行
      const result = await executeGraphQL(TOURNAMENTS_QUERY);

      // エラーレスポンスの検証
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].message).toContain('テスト用エラー');
    });
  });

  describe('ミューテーション: createTournament', () => {
    // createTournamentミューテーションのテスト定義
    const CREATE_TOURNAMENT_MUTATION = gql`
      mutation CreateTournament($input: CreateTournamentInput!) {
        createTournament(input: $input) {
          id
          name
          createdAt
        }
      }
    `;

    it('新しいトーナメントを作成できること', async () => {
      // 入力データとモックの準備
      const input = { name: 'New Tournament' };
      const mockTournament = {
        id: { value: '3' },
        nameValue: 'New Tournament',
        createdAt: new Date('2025-04-19T09:00:00Z'),
        draftStatus: null,
      } as unknown as Tournament;

      // CreateTournamentUseCaseのモック
      (CreateTournamentUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockTournament);

      // GraphQLミューテーションの実行
      const result = await executeGraphQL(CREATE_TOURNAMENT_MUTATION, { input });

      // レスポンスの検証
      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data.createTournament).toEqual({
        id: '3',
        name: 'New Tournament',
        createdAt: expect.any(String),
      });

      // ユースケースが正しく呼び出されたか検証
      expect(CreateTournamentUseCase.prototype.execute).toHaveBeenCalledTimes(1);
      expect(CreateTournamentUseCase.prototype.execute).toHaveBeenCalledWith(input);
    });

    it('エラーが発生した場合はエラー情報を返すこと', async () => {
      // 入力データの準備
      const input = { name: '' };

      // CreateTournamentUseCaseがエラーを投げるようにモック
      const mockError = new Error('トーナメント名は必須です');
      (CreateTournamentUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);

      // GraphQLミューテーションの実行
      const result = await executeGraphQL(CREATE_TOURNAMENT_MUTATION, { input });

      // エラーレスポンスの検証
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].message).toContain('トーナメント名は必須です');
    });
  });

  describe('Tournament型のフィールドリゾルバー', () => {
    // フィールドリゾルバーをテストするためのクエリ定義
    const TOURNAMENT_WITH_FIELDS_QUERY = gql`
      query {
        tournaments {
          id
          name
          draftStatus {
            round
            turn
            status
          }
          participants {
            id
            name
          }
          teams {
            id
            name
          }
          drafts {
            id
            round
          }
        }
      }
    `;

    it('Tournament型の各フィールドにアクセスできること', async () => {
      // モックデータの準備 - ドラフト状態を含むトーナメント
      const mockTournaments = [
        {
          id: { value: '1' },
          nameValue: 'Tournament with Draft',
          createdAt: new Date('2025-04-01T10:00:00Z'),
          draftStatus: {
            round: 2,
            turn: 3,
            isActive: true,
          },
        },
      ] as unknown as Tournament[];

      // GetTournamentsUseCaseのモック
      (GetTournamentsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockTournaments);

      // GraphQLクエリの実行
      const result = await executeGraphQL(TOURNAMENT_WITH_FIELDS_QUERY);

      // レスポンスの検証
      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data.tournaments).toHaveLength(1);

      const tournament = result.data.tournaments[0];
      expect(tournament).toEqual({
        id: '1',
        name: 'Tournament with Draft',
        draftStatus: {
          round: 2,
          turn: 3,
          status: 'active',
        },
        participants: [], // 現在の実装では空配列
        teams: [], // 現在の実装では空配列
        drafts: [], // 現在の実装では空配列
      });
    });
  });
});
