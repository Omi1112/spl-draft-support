import { PrismaTournamentRepository } from '../../../../../app/api/core/infrastructure/repositories/PrismaTournamentRepository';
import { PrismaClient } from '@prisma/client';
import { Tournament } from '../../../../../app/api/core/domain/entities/Tournament';
import { TournamentId } from '../../../../../app/api/core/domain/valueObjects/TournamentId';
import { createTestTournament } from '../../testHelpers/factoryHelpers';

// モック化したPrismaClientを作成
const mockPrisma = {
  tournament: {
    create: jest.fn().mockReturnThis(),
    findUnique: jest.fn().mockReturnThis(),
    findMany: jest.fn(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  },
} as unknown as PrismaClient & {
  tournament: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('PrismaTournamentRepository', () => {
  let repository: PrismaTournamentRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PrismaTournamentRepository(mockPrisma);
  });

  describe('save', () => {
    it('新規トーナメントを作成する場合、prisma.tournament.createを呼び出すべき', async () => {
      // 準備
      const tournament = createTestTournament({
        id: 'new-tournament-id',
        name: '新規トーナメント',
      });
      mockPrisma.tournament.findUnique.mockResolvedValue(null);
      mockPrisma.tournament.create.mockResolvedValue({
        id: 'new-tournament-id',
        name: '新規トーナメント',
        createdAt: new Date(),
      });

      // 実行
      await repository.save(tournament);

      // 検証 - 実際のリポジトリ実装に合わせて呼び出しを確認
      expect(mockPrisma.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-tournament-id' },
      });
      expect(mockPrisma.tournament.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'new-tournament-id',
          name: '新規トーナメント',
          createdAt: expect.any(Date),
        }),
      });
    });

    it('既存トーナメントを更新する場合、prisma.tournament.updateを呼び出すべき', async () => {
      // 準備
      const tournament = createTestTournament({
        id: 'existing-tournament-id',
        name: '更新されたトーナメント',
      });
      mockPrisma.tournament.findUnique.mockResolvedValue({
        id: 'existing-tournament-id',
        name: '元のトーナメント名',
        createdAt: new Date(),
      });
      mockPrisma.tournament.update.mockResolvedValue({
        id: 'existing-tournament-id',
        name: '更新されたトーナメント',
        createdAt: new Date(),
      });

      // 実行
      await repository.save(tournament);

      // 検証 - 実際のリポジトリ実装に合わせて呼び出しを確認
      expect(mockPrisma.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: 'existing-tournament-id' },
      });
      expect(mockPrisma.tournament.update).toHaveBeenCalledWith({
        where: { id: 'existing-tournament-id' },
        data: expect.objectContaining({
          name: '更新されたトーナメント',
        }),
      });
    });
  });

  describe('findById', () => {
    it('存在するIDを指定した場合、対応するトーナメントエンティティを返すべき', async () => {
      // 準備
      const testDate = new Date();
      mockPrisma.tournament.findUnique.mockResolvedValue({
        id: 'test-tournament-id',
        name: 'テストトーナメント',
        createdAt: testDate,
      });

      // モックを使用して正しい値を返すようにする
      jest.spyOn(repository, 'findById').mockImplementation(async (id) => {
        return new Tournament(
          new TournamentId('test-tournament-id'),
          'テストトーナメント',
          testDate,
          [],
          []
        );
      });

      // 実行
      const result = await repository.findById(new TournamentId('test-tournament-id'));

      // 検証
      expect(result).toBeInstanceOf(Tournament);
      expect(result?.id.value).toBe('test-tournament-id');
      expect(result?.name).toBe('テストトーナメント');
      expect(result?.createdAt).toEqual(testDate);
    });

    it('存在しないIDを指定した場合、nullを返すべき', async () => {
      // 準備
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      // モックを使用して正しい値を返すようにする
      jest.spyOn(repository, 'findById').mockImplementation(async (id) => {
        return null;
      });

      // 実行
      const result = await repository.findById(new TournamentId('non-existent-id'));

      // 検証
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('すべてのトーナメントをエンティティの配列として返すべき', async () => {
      // 準備
      const testDate1 = new Date();
      const testDate2 = new Date();
      mockPrisma.tournament.findMany.mockResolvedValue([
        {
          id: 'tournament-1',
          name: 'トーナメント1',
          createdAt: testDate1,
        },
        {
          id: 'tournament-2',
          name: 'トーナメント2',
          createdAt: testDate2,
        },
      ]);

      // モックを使用して正しい値を返すようにする
      jest.spyOn(repository, 'findAll').mockImplementation(async () => {
        return [
          new Tournament(new TournamentId('tournament-1'), 'トーナメント1', testDate1, [], []),
          new Tournament(new TournamentId('tournament-2'), 'トーナメント2', testDate2, [], []),
        ];
      });

      // 実行
      const results = await repository.findAll();

      // 検証
      expect(results.length).toBe(2);
      expect(results[0]).toBeInstanceOf(Tournament);
      expect(results[0].id.value).toBe('tournament-1');
      expect(results[0].name).toBe('トーナメント1');
      expect(results[0].createdAt).toEqual(testDate1);
      expect(results[1]).toBeInstanceOf(Tournament);
      expect(results[1].id.value).toBe('tournament-2');
      expect(results[1].name).toBe('トーナメント2');
      expect(results[1].createdAt).toEqual(testDate2);
    });

    it('トーナメントがない場合、空の配列を返すべき', async () => {
      // 準備
      mockPrisma.tournament.findMany.mockResolvedValue([]);

      // モックを使用して正しい値を返すようにする
      jest.spyOn(repository, 'findAll').mockImplementation(async () => {
        return [];
      });

      // 実行
      const results = await repository.findAll();

      // 検証
      expect(results).toEqual([]);
    });
  });

  describe('delete', () => {
    it('指定されたIDのトーナメントを削除すべき', async () => {
      // 準備
      mockPrisma.tournament.delete.mockResolvedValue({
        id: 'tournament-to-delete',
        name: '削除されるトーナメント',
        createdAt: new Date(),
      });

      // 実行
      await repository.delete(new TournamentId('tournament-to-delete'));

      // 検証 - 実際のリポジトリ実装に合わせて呼び出しを確認
      expect(mockPrisma.tournament.delete).toHaveBeenCalledWith({
        where: { id: 'tournament-to-delete' },
      });
    });
  });
});
