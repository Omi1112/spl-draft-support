import { GetTournamentUseCase } from '../../../../../../app/api/core/application/useCases/tournament/GetTournamentUseCase';
import { MockTournamentRepository } from '../../../testHelpers/mockHelpers';
import { TournamentId } from '../../../../../../app/api/core/domain/valueObjects/TournamentId';
import { createTestTournament } from '../../../testHelpers/factoryHelpers';

describe('GetTournamentUseCase', () => {
  let mockTournamentRepository: MockTournamentRepository;
  let getTournamentUseCase: GetTournamentUseCase;

  beforeEach(() => {
    mockTournamentRepository = new MockTournamentRepository();
    getTournamentUseCase = new GetTournamentUseCase(mockTournamentRepository);
  });

  it('存在するトーナメントIDを指定した場合、対応するトーナメントDTOを返すべき', async () => {
    // 準備: リポジトリにテストデータを追加
    const testTournament = createTestTournament({
      id: 'test-tournament-id',
      name: 'テストトーナメント',
    });
    await mockTournamentRepository.save(testTournament);

    // 実行
    const result = await getTournamentUseCase.execute('test-tournament-id');

    // 検証
    expect(result).toBeDefined();
    expect(result.id).toBe('test-tournament-id');
    expect(result.name).toBe('テストトーナメント');
    expect(result.createdAt).toBeDefined();
  });

  it('存在しないトーナメントIDを指定した場合、エラーをスローするべき', async () => {
    // 実行と検証
    await expect(getTournamentUseCase.execute('non-existent-id')).rejects.toThrow(
      'トーナメントが見つかりません'
    );
  });
});
