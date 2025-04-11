// filepath: /workspace/__tests__/api/core/application/useCases/draft/ResetDraftUseCase.test.ts
import { ResetDraftUseCase } from '../../../../../../app/api/core/application/useCases/draft/ResetDraftUseCase';
import { DraftDomainService } from '../../../../../../app/api/core/domain/services/DraftDomainService';
import { TournamentId } from '../../../../../../app/api/core/domain/valueObjects/TournamentId';

describe('ResetDraftUseCase', () => {
  // モックドメインサービスの作成
  const mockDraftDomainService: jest.Mocked<DraftDomainService> = {
    resetDraft: jest.fn(),
  };

  let useCase: ResetDraftUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ResetDraftUseCase(mockDraftDomainService);
  });

  it('正常にドラフトをリセットできること', async () => {
    // モックの設定
    mockDraftDomainService.resetDraft.mockResolvedValue(true);

    // 実行
    const tournamentId = 'tournament-1';
    const result = await useCase.execute(tournamentId);

    // 検証
    expect(result).toBe(true);
    expect(mockDraftDomainService.resetDraft).toHaveBeenCalledTimes(1);
    expect(mockDraftDomainService.resetDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        value: tournamentId,
      })
    );
  });

  it('ドメインサービスがエラーを投げた場合、適切にハンドリングすること', async () => {
    // モックの設定
    mockDraftDomainService.resetDraft.mockRejectedValue(new Error('ドメインサービスエラー'));

    // 実行と検証
    await expect(useCase.execute('tournament-1')).rejects.toThrow(
      'ドラフトのリセットに失敗しました'
    );
    expect(mockDraftDomainService.resetDraft).toHaveBeenCalledTimes(1);
  });

  it('不正なトーナメントIDの場合もドメインサービスに委譲すること', async () => {
    // モックの設定
    mockDraftDomainService.resetDraft.mockResolvedValue(true);

    // 実行
    const tournamentId = '';
    await useCase.execute(tournamentId);

    // 検証 - TournamentIdのバリデーションはドメインサービスで行われるべき
    expect(mockDraftDomainService.resetDraft).toHaveBeenCalledTimes(1);
    expect(mockDraftDomainService.resetDraft).toHaveBeenCalledWith(expect.any(TournamentId));
  });
});
