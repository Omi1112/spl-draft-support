import { DraftDomainService } from '../../../../../app/api/core/domain/services/DraftDomainService';
import { TournamentId } from '../../../../../app/api/core/domain/valueObjects/TournamentId';
import { TeamId } from '../../../../../app/api/core/domain/valueObjects/TeamId';
import { ParticipantId } from '../../../../../app/api/core/domain/valueObjects/ParticipantId';
import { Team } from '../../../../../app/api/core/domain/entities/Team';
import { Tournament } from '../../../../../app/api/core/domain/entities/Tournament';
import { TournamentParticipant } from '../../../../../app/api/core/domain/entities/TournamentParticipant';

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

const mockTournamentRepository = {
  findById: jest.fn(),
  save: jest.fn(),
};

describe('DraftDomainService', () => {
  let draftDomainService: DraftDomainService;

  // 各テスト前に初期化
  beforeEach(() => {
    jest.clearAllMocks();
    draftDomainService = new DraftDomainService(
      mockDraftRepository,
      mockTeamRepository,
      mockTournamentParticipantRepository,
      mockTournamentRepository
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

  describe('startDraft', () => {
    it('正常にドラフトを開始できること', async () => {
      // テスト名を修正
      // テストデータ
      const tournamentId = new TournamentId('tournament-start-1');
      const captainId1 = ParticipantId.reconstruct('captain-1');
      const captainId2 = ParticipantId.reconstruct('captain-2');
      // Tournament.reconstruct の引数を実際のコンストラクタに合わせて修正
      const mockTournament = Tournament.reconstruct(
        tournamentId.value,
        'Test Tournament',
        'ongoing',
        new Date().toISOString(),
        1, // draftRound
        1, // draftTurn
        false // draftIsActive
      );
      // TournamentParticipant.reconstruct の引数を実際のコンストラクタに合わせて修正
      const mockParticipants = [
        TournamentParticipant.reconstruct(
          'tp-1',
          tournamentId.value,
          captainId1.value,
          true, // isCaptain
          null, // teamId
          new Date().toISOString()
        ),
        TournamentParticipant.reconstruct(
          'tp-2',
          tournamentId.value,
          captainId2.value,
          true, // isCaptain
          null, // teamId
          new Date().toISOString()
        ),
      ];
      const createdTeam1 = Team.create('Team Captain 1', captainId1, tournamentId);
      const createdTeam2 = Team.create('Team Captain 2', captainId2, tournamentId);

      // モックの設定
      mockTournamentRepository.findById.mockResolvedValue(mockTournament);
      mockTournamentParticipantRepository.findByTournamentId.mockResolvedValue(mockParticipants);
      mockTeamRepository.findByTournamentIdAndCaptainId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      // save のモックは戻り値を検証する必要がなくなったが、呼び出しは確認
      mockTeamRepository.save
        .mockResolvedValueOnce(createdTeam1) // PrismaTeamRepository.save は依然として Team を返す
        .mockResolvedValueOnce(createdTeam2);

      mockTournamentParticipantRepository.save.mockResolvedValue(undefined);
      mockTournamentRepository.save.mockResolvedValue(undefined);

      // 実行 & 検証 (戻り値がないことを確認)
      await expect(draftDomainService.startDraft(tournamentId)).resolves.toBeUndefined();

      // 検証 (呼び出し回数など)
      expect(mockTournamentRepository.findById).toHaveBeenCalledWith(tournamentId);
      expect(mockTournamentParticipantRepository.findByTournamentId).toHaveBeenCalledWith(
        tournamentId
      );
      expect(mockTeamRepository.findByTournamentIdAndCaptainId).toHaveBeenCalledTimes(2);
      expect(mockTeamRepository.save).toHaveBeenCalledTimes(2);
      expect(mockTournamentParticipantRepository.save).toHaveBeenCalledTimes(2);
      expect(mockTournamentRepository.save).toHaveBeenCalledTimes(1);

      // トーナメントのドラフト状態が更新されているか
      expect(mockTournamentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _draftIsActive: true,
          _draftRound: 1,
          _draftTurn: 1,
        })
      );
    });

    it('トーナメントが見つからない場合にエラーをスローすること', async () => {
      const tournamentId = new TournamentId('non-existent-tournament');
      mockTournamentRepository.findById.mockResolvedValue(null);

      await expect(draftDomainService.startDraft(tournamentId)).rejects.toThrow(
        'トーナメントが見つかりません'
      );
    });

    it('キャプテンが見つからない場合にエラーをスローすること', async () => {
      const tournamentId = new TournamentId('tournament-no-captains');
      const mockTournament = Tournament.reconstruct(
        tournamentId.value,
        'Test Tournament',
        'ongoing',
        new Date().toISOString(),
        1, // draftRound
        1, // draftTurn
        false // draftIsActive
      );
      mockTournamentRepository.findById.mockResolvedValue(mockTournament);
      mockTournamentParticipantRepository.findByTournamentId.mockResolvedValue([]); // キャプテンがいない

      await expect(draftDomainService.startDraft(tournamentId)).rejects.toThrow(
        'トーナメントにキャプテンが登録されていません'
      );
    });
  });
});
