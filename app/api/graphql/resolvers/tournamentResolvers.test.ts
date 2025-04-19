// filepath: /workspace/app/api/graphql/resolvers/tournamentResolvers.test.ts
import { CreateTournamentUseCase } from '@/app/api/core/application/usecases/tournament/CreateTournamentUseCase';
import { GetTournamentsUseCase } from '@/app/api/core/application/usecases/tournament/GetTournamentsUseCase';
import { TournamentMapper } from '@/app/api/core/application/mappers/TournamentMapper';
import { Tournament } from '@/app/api/core/domain/entities/Tournament';
import { tournamentResolvers } from './tournamentResolvers';

// CreateTournamentUseCaseとGetTournamentsUseCaseのモック
jest.mock('@/app/api/core/application/usecases/tournament/CreateTournamentUseCase');
jest.mock('@/app/api/core/application/usecases/tournament/GetTournamentsUseCase');
jest.mock('@/app/api/core/application/mappers/TournamentMapper');

describe('tournamentResolvers', () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Query', () => {
    describe('tournaments', () => {
      it('すべてのトーナメントを取得して返すこと', async () => {
        // モックデータの準備
        const mockTournaments = [
          { id: { value: '1' }, nameValue: 'Tournament 1', createdAt: new Date() },
          { id: { value: '2' }, nameValue: 'Tournament 2', createdAt: new Date() },
        ] as unknown as Tournament[];

        const mockTournamentDtos = [
          { id: '1', name: 'Tournament 1', createdAt: expect.any(String) },
          { id: '2', name: 'Tournament 2', createdAt: expect.any(String) },
        ];

        // GetTournamentsUseCaseのexecuteメソッドのモック
        (GetTournamentsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockTournaments);

        // TournamentMapperのtoDtoメソッドのモック
        (TournamentMapper.toDto as jest.Mock).mockImplementation((tournament) => {
          if (tournament.id.value === '1') return mockTournamentDtos[0];
          return mockTournamentDtos[1];
        });

        // tournamentResolverのtournamentsメソッドを実行
        const result = await tournamentResolvers.Query.tournaments();

        // 期待される結果の検証
        expect(GetTournamentsUseCase.prototype.execute).toHaveBeenCalled();
        expect(TournamentMapper.toDto).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockTournamentDtos);
      });

      it('エラーが発生した場合はエラーをスローすること', async () => {
        // GetTournamentsUseCaseのexecuteメソッドがエラーをスローするようにモック
        const mockError = new Error('テストエラー');
        (GetTournamentsUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);

        // tournamentResolverのtournamentsメソッドを実行し、エラーがスローされることを確認
        await expect(tournamentResolvers.Query.tournaments()).rejects.toThrow();
      });
    });
  });

  describe('Mutation', () => {
    describe('createTournament', () => {
      it('新しいトーナメントを作成して返すこと', async () => {
        // モックデータの準備
        const input = { name: 'New Tournament' };
        const mockTournament = {
          id: { value: '3' },
          nameValue: 'New Tournament',
          createdAt: new Date(),
        } as unknown as Tournament;

        const mockTournamentDto = {
          id: '3',
          name: 'New Tournament',
          createdAt: expect.any(String),
        };

        // CreateTournamentUseCaseのexecuteメソッドのモック
        (CreateTournamentUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockTournament);

        // TournamentMapperのtoDtoメソッドのモック
        (TournamentMapper.toDto as jest.Mock).mockReturnValue(mockTournamentDto);

        // tournamentResolverのcreateTournamentメソッドを実行
        const result = await tournamentResolvers.Mutation.createTournament({}, { input });

        // 期待される結果の検証
        expect(CreateTournamentUseCase.prototype.execute).toHaveBeenCalledWith(input);
        expect(TournamentMapper.toDto).toHaveBeenCalledWith(mockTournament);
        expect(result).toEqual(mockTournamentDto);
      });

      it('エラーが発生した場合はエラーをスローすること', async () => {
        // CreateTournamentUseCaseのexecuteメソッドがエラーをスローするようにモック
        const mockError = new Error('テストエラー');
        (CreateTournamentUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);

        // tournamentResolverのcreateTournamentメソッドを実行し、エラーがスローされることを確認
        await expect(
          tournamentResolvers.Mutation.createTournament({}, { input: { name: 'New Tournament' } })
        ).rejects.toThrow();
      });
    });
  });

  describe('Tournament', () => {
    describe('draftStatus', () => {
      it('親オブジェクトにdraftStatusがある場合、適切に変換して返すこと', async () => {
        // モックの親オブジェクト
        const mockParent = {
          id: '1',
          draftStatus: {
            round: 2,
            turn: 3,
            isActive: true,
          },
        };

        // 期待される結果
        const expectedDraftStatus = {
          round: 2,
          turn: 3,
          status: 'active',
        };

        // Tournament.draftStatusリゾルバーを実行
        const result = await tournamentResolvers.Tournament.draftStatus(mockParent);

        // 期待される結果の検証
        expect(result).toEqual(expectedDraftStatus);
      });

      it('親オブジェクトにdraftStatusがない場合、nullを返すこと', async () => {
        // draftStatusを持たない親オブジェクト
        const mockParent = {
          id: '1',
        };

        // Tournament.draftStatusリゾルバーを実行
        const result = await tournamentResolvers.Tournament.draftStatus(mockParent);

        // nullが返されることを検証
        expect(result).toBeNull();
      });
    });

    describe('participants', () => {
      it('空の配列を返すこと（実装前の期待動作）', async () => {
        const mockParent = { id: '1' };
        const result = await tournamentResolvers.Tournament.participants(mockParent);
        expect(result).toEqual([]);
      });
    });

    describe('teams', () => {
      it('空の配列を返すこと（実装前の期待動作）', async () => {
        const mockParent = { id: '1' };
        const result = await tournamentResolvers.Tournament.teams(mockParent);
        expect(result).toEqual([]);
      });
    });

    describe('drafts', () => {
      it('空の配列を返すこと（実装前の期待動作）', async () => {
        const mockParent = { id: '1' };
        const result = await tournamentResolvers.Tournament.drafts(mockParent);
        expect(result).toEqual([]);
      });
    });
  });
});
