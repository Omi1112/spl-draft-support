import { CreateTournamentUseCase } from '../../../../../../app/api/core/application/useCases/tournament/CreateTournamentUseCase';
import { MockTournamentRepository } from '../../../testHelpers/mockHelpers';
import { CreateTournamentDTO } from '../../../../../../app/api/core/application/interfaces/DTOs';
import {
  TestContext,
  createTestContext,
  cleanupMocks,
} from '../../../testHelpers/testBestPractices';

describe('CreateTournamentUseCase', () => {
  // 各テスト用の独立したコンテキストを作成
  const createContext = createTestContext<CreateTournamentUseCase>(() => {
    const mockTournamentRepository = new MockTournamentRepository();
    const createTournamentUseCase = new CreateTournamentUseCase(mockTournamentRepository);

    return {
      sut: createTournamentUseCase,
      dependencies: {
        mockTournamentRepository,
      },
    };
  });

  // モックを保存するための配列
  let mocks: jest.SpyInstance[] = [];

  // 各テスト後にモックをリストア
  afterEach(() => {
    cleanupMocks(mocks);
    mocks = [];
  });

  it('トーナメントを正常に作成しDTOを返すべき', async () => {
    // 毎回新しいコンテキストを取得
    const { sut, dependencies } = createContext();
    const { mockTournamentRepository } = dependencies;

    // 準備
    const dto: CreateTournamentDTO = {
      name: 'テストトーナメント',
    };

    // 実行
    const result = await sut.execute(dto);

    // 検証
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe('テストトーナメント');
    expect(result.createdAt).toBeDefined();

    // リポジトリに保存されていることを確認
    expect(mockTournamentRepository.tournaments.length).toBe(1);
    expect(mockTournamentRepository.tournaments[0].name).toBe('テストトーナメント');
  });

  it('異なる名前で複数のトーナメントを作成できるべき', async () => {
    // 毎回新しいコンテキストを取得
    const { sut, dependencies } = createContext();
    const { mockTournamentRepository } = dependencies;

    // 準備
    const dto1: CreateTournamentDTO = {
      name: 'テストトーナメント1',
    };
    const dto2: CreateTournamentDTO = {
      name: 'テストトーナメント2',
    };

    // IDの生成をモック化して異なるIDが生成されることを保証
    const dateMock = jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1000) // 1回目の呼び出し
      .mockReturnValueOnce(2000); // 2回目の呼び出し

    // モックを配列に追加して、後でクリーンアップできるようにする
    mocks.push(dateMock);

    // 実行
    const result1 = await sut.execute(dto1);
    const result2 = await sut.execute(dto2);

    // 検証
    expect(result1.id).not.toBe(result2.id);
    expect(result1.name).toBe('テストトーナメント1');
    expect(result2.name).toBe('テストトーナメント2');

    // リポジトリに両方保存されていることを確認
    expect(mockTournamentRepository.tournaments.length).toBe(2);
  });
});
