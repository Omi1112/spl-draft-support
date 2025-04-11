// filepath: /workspace/__tests__/api/core/domain/services/DraftDomainService.test.ts
import { DraftDomainService } from '../../../../../app/api/core/domain/services/DraftDomainService';
import { DraftDomainServiceImpl } from '../../../../../app/api/core/domain/services/DraftDomainService';
import { TournamentId } from '../../../../../app/api/core/domain/valueObjects/TournamentId';
import { TeamId } from '../../../../../app/api/core/domain/valueObjects/TeamId';

// モックリポジトリの作成
const mockDraftRepository = {
  deleteByTournamentId: jest.fn(),
  findById: jest.fn(),
  findByTournamentId: jest.fn(),
  findByCaptainId: jest.fn(),
  findByTournamentAndCaptain: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockTeamRepository = {
  findById: jest.fn(),
  findByTournamentId: jest.fn(),
  findByCaptainId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteByTournamentId: jest.fn(),
};

const mockTournamentParticipantRepository = {
  findByTournamentAndParticipant: jest.fn(),
  findById: jest.fn(),
  findByTournamentId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  clearTeamReferences: jest.fn(),
};

const mockDraftStatusRepository = {
  findByTournamentId: jest.fn(),
  save: jest.fn(),
  deleteByTournamentId: jest.fn(),
  createInitialStatus: jest.fn(),
};

const mockTeamMemberRepository = {
  deleteByTeamId: jest.fn(),
};

describe('DraftDomainService', () => {
  let draftDomainService: DraftDomainService;

  // 各テスト前に初期化
  beforeEach(() => {
    jest.clearAllMocks();
    draftDomainService = new DraftDomainServiceImpl(
      mockDraftRepository,
      mockTeamRepository,
      mockTournamentParticipantRepository,
      mockDraftStatusRepository,
      mockTeamMemberRepository
    );
  });

  describe('resetDraft', () => {
    it('正常にドラフト関連データをリセットできること', async () => {
      // テストデータ
      const tournamentId = new TournamentId('tournament-1');
      const teams = [{ id: new TeamId('team-1') }, { id: new TeamId('team-2') }];

      // モックの設定
      mockTeamRepository.findByTournamentId.mockResolvedValue(teams);
      mockTeamMemberRepository.deleteByTeamId.mockResolvedValue(undefined);
      mockTeamRepository.deleteByTournamentId.mockResolvedValue(undefined);
      mockTournamentParticipantRepository.clearTeamReferences.mockResolvedValue(undefined);
      mockDraftRepository.deleteByTournamentId.mockResolvedValue(undefined);
      mockDraftStatusRepository.deleteByTournamentId.mockResolvedValue(undefined);
      mockDraftStatusRepository.createInitialStatus.mockResolvedValue({
        id: { value: 'draft-status-1' },
        tournamentId: tournamentId,
        round: 1,
        turn: 1,
        isActive: true,
        createdAt: new Date(),
      });

      // 実行
      const result = await draftDomainService.resetDraft(tournamentId);

      // 検証
      expect(result).toBe(true);
      expect(mockTeamRepository.findByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockTeamMemberRepository.deleteByTeamId).toHaveBeenCalledTimes(2);
      expect(mockTeamMemberRepository.deleteByTeamId).toHaveBeenCalledWith(teams[0].id);
      expect(mockTeamMemberRepository.deleteByTeamId).toHaveBeenCalledWith(teams[1].id);
      expect(mockTeamRepository.deleteByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockTournamentParticipantRepository.clearTeamReferences).toHaveBeenCalledWith(
        tournamentId
      );
      expect(mockDraftRepository.deleteByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockDraftStatusRepository.deleteByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockDraftStatusRepository.createInitialStatus).toHaveBeenCalledWith(tournamentId);
    });

    it('エラーが発生した場合は例外をスローすること', async () => {
      // テストデータ
      const tournamentId = new TournamentId('tournament-1');

      // モックの設定 - エラーを発生させる
      mockTeamRepository.findByTournamentId.mockRejectedValue(new Error('テスト用エラー'));

      // 実行と検証
      await expect(draftDomainService.resetDraft(tournamentId)).rejects.toThrow(
        'ドラフトのリセットに失敗しました'
      );
      expect(mockTeamRepository.findByTournamentId).toHaveBeenCalledWith(tournamentId);
      // エラー発生後は後続の処理が呼ばれないことを確認
      expect(mockTeamMemberRepository.deleteByTeamId).not.toHaveBeenCalled();
    });

    it('チームが存在しない場合でも正常に実行できること', async () => {
      // テストデータ
      const tournamentId = new TournamentId('tournament-1');

      // モックの設定 - 空の配列を返す
      mockTeamRepository.findByTournamentId.mockResolvedValue([]);
      mockTeamRepository.deleteByTournamentId.mockResolvedValue(undefined);
      mockTournamentParticipantRepository.clearTeamReferences.mockResolvedValue(undefined);
      mockDraftRepository.deleteByTournamentId.mockResolvedValue(undefined);
      mockDraftStatusRepository.deleteByTournamentId.mockResolvedValue(undefined);
      mockDraftStatusRepository.createInitialStatus.mockResolvedValue({
        id: { value: 'draft-status-1' },
        tournamentId: tournamentId,
        round: 1,
        turn: 1,
        isActive: true,
        createdAt: new Date(),
      });

      // 実行
      const result = await draftDomainService.resetDraft(tournamentId);

      // 検証
      expect(result).toBe(true);
      expect(mockTeamRepository.findByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockTeamMemberRepository.deleteByTeamId).not.toHaveBeenCalled(); // チームがないのでチームメンバー削除は呼ばれない
      expect(mockTeamRepository.deleteByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockTournamentParticipantRepository.clearTeamReferences).toHaveBeenCalledWith(
        tournamentId
      );
      expect(mockDraftRepository.deleteByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockDraftStatusRepository.deleteByTournamentId).toHaveBeenCalledWith(tournamentId);
      expect(mockDraftStatusRepository.createInitialStatus).toHaveBeenCalledWith(tournamentId);
    });
  });
});
