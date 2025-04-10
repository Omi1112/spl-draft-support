import { ResetDraftUseCase } from '../../../../../../app/api/core/application/useCases/draft/ResetDraftUseCase';
import { DraftRepository } from '../../../../../../app/api/core/domain/repositories/DraftRepository';
import { TournamentId } from '../../../../../../app/api/core/domain/valueObjects/TournamentId';

// モックリポジトリの作成
class MockDraftRepository implements DraftRepository {
  resetMock = jest.fn();

  async findById(): Promise<any> {
    return null;
  }

  async findByTournamentId(): Promise<any[]> {
    return [];
  }

  async findByCaptainId(): Promise<any[]> {
    return [];
  }

  async findByTournamentAndCaptain(): Promise<any[]> {
    return [];
  }

  async save(): Promise<any> {
    return {};
  }

  async delete(): Promise<void> {
    return;
  }

  async reset(tournamentId: TournamentId): Promise<boolean> {
    return this.resetMock(tournamentId);
  }
}

describe('ResetDraftUseCase', () => {
  let mockDraftRepository: MockDraftRepository;
  let resetDraftUseCase: ResetDraftUseCase;

  beforeEach(() => {
    mockDraftRepository = new MockDraftRepository();
    resetDraftUseCase = new ResetDraftUseCase(mockDraftRepository);
  });

  it('should call repository reset method with correct tournament id', async () => {
    // 準備
    const tournamentId = 'test-tournament-id';
    mockDraftRepository.resetMock.mockResolvedValue(true);

    // 実行
    const result = await resetDraftUseCase.execute(tournamentId);

    // 検証
    expect(mockDraftRepository.resetMock).toHaveBeenCalledTimes(1);
    expect(mockDraftRepository.resetMock).toHaveBeenCalledWith(
      expect.objectContaining({ value: tournamentId })
    );
    expect(result).toBe(true);
  });

  it('should handle errors from repository', async () => {
    // 準備
    const tournamentId = 'test-tournament-id';
    mockDraftRepository.resetMock.mockRejectedValue(new Error('Repository error'));

    // 実行と検証
    await expect(resetDraftUseCase.execute(tournamentId)).rejects.toThrow(
      'ドラフトのリセットに失敗しました'
    );
  });
});
