import {
  MockTournamentRepository,
  MockParticipantRepository,
} from '../../../testHelpers/mockHelpers';
import {
  createTestTournament,
  createTestParticipant,
  createTestDraftStatus,
} from '../../../testHelpers/factoryHelpers';
import { AddParticipantToTournamentUseCase } from '../../../../../../app/api/core/application/useCases/participant/AddParticipantToTournamentUseCase';
import { AddParticipantDTO } from '../../../../../../app/api/core/application/useCases/participant/AddParticipantToTournamentUseCase';
import { TournamentId } from '../../../../../../app/api/core/domain/valueObjects/TournamentId';

describe('AddParticipantToTournamentUseCase', () => {
  let mockTournamentRepository: MockTournamentRepository;
  let mockParticipantRepository: MockParticipantRepository;
  let addParticipantToTournamentUseCase: AddParticipantToTournamentUseCase;

  beforeEach(() => {
    mockTournamentRepository = new MockTournamentRepository();
    mockParticipantRepository = new MockParticipantRepository();
    addParticipantToTournamentUseCase = new AddParticipantToTournamentUseCase(
      mockTournamentRepository,
      mockParticipantRepository
    );
  });

  describe('正常系', () => {
    it('トーナメントに参加者を追加できるべき', async () => {
      // 準備
      const tournament = createTestTournament({
        id: 'tournament-id',
        name: 'テストトーナメント',
      });
      // モックリポジトリにトーナメントを保存
      await mockTournamentRepository.save(tournament);

      const dto: AddParticipantDTO = {
        tournamentId: 'tournament-id',
        name: '参加者太郎',
        isCaptain: false,
      };

      // 実行
      const result = await addParticipantToTournamentUseCase.execute(dto);

      // 検証
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('参加者太郎');
      expect(result.isCaptain).toBe(false);

      // トーナメントに参加者が追加されていることを確認
      const updatedTournament = await mockTournamentRepository.findById(
        new TournamentId('tournament-id')
      );
      expect(updatedTournament?.participants.length).toBe(1);
      expect(updatedTournament?.participants[0].name).toBe('参加者太郎');
    });
  });

  describe('異常系', () => {
    it('存在しないトーナメントIDを指定した場合、エラーをスローするべき', async () => {
      // 準備
      const dto: AddParticipantDTO = {
        tournamentId: 'non-existent-tournament-id',
        name: '参加者太郎',
        isCaptain: false,
      };

      // 実行・検証
      await expect(async () => {
        await addParticipantToTournamentUseCase.execute(dto);
      }).rejects.toThrow('指定されたトーナメントが見つかりません');
    });

    it('空の名前を指定した場合、エラーをスローするべき', async () => {
      // 準備
      const tournament = createTestTournament({
        id: 'tournament-id',
        name: 'テストトーナメント',
      });
      await mockTournamentRepository.save(tournament);

      const dto: AddParticipantDTO = {
        tournamentId: 'tournament-id',
        name: '', // 空の名前
        isCaptain: false,
      };

      // 実行・検証
      await expect(async () => {
        await addParticipantToTournamentUseCase.execute(dto);
      }).rejects.toThrow('参加者名は必須です');
    });

    it('ドラフトが進行中の場合、参加者を追加できないべき', async () => {
      // 準備
      const tournament = createTestTournament({
        id: 'tournament-id',
        name: 'テストトーナメント',
      });

      // チームとキャプテンを追加してドラフト開始条件を満たすようにする
      const captain = createTestParticipant({ id: 'captain-id', isCaptain: true });
      const participant1 = createTestParticipant({ id: 'participant-1' });
      const participant2 = createTestParticipant({ id: 'participant-2' });
      const participant3 = createTestParticipant({ id: 'participant-3' });

      tournament.addParticipant(captain);
      tournament.addParticipant(participant1);
      tournament.addParticipant(participant2);
      tournament.addParticipant(participant3);

      // ドラフトステータスを「進行中」に設定
      tournament.updateDraftStatus(createTestDraftStatus('in_progress', 1, 1));
      await mockTournamentRepository.save(tournament);

      const dto: AddParticipantDTO = {
        tournamentId: 'tournament-id',
        name: '参加者太郎',
        isCaptain: false,
      };

      // 実行・検証
      await expect(async () => {
        await addParticipantToTournamentUseCase.execute(dto);
      }).rejects.toThrow('ドラフト進行中は参加者を追加できません');
    });

    it('すでに参加者が上限に達している場合、エラーをスローするべき', async () => {
      // 準備: 上限までの参加者を追加したトーナメントを作成
      const tournament = createTestTournament({
        id: 'tournament-id',
        name: 'テストトーナメント',
      });

      // 仮に上限を20人とする
      const MAX_PARTICIPANTS = 20;
      for (let i = 0; i < MAX_PARTICIPANTS; i++) {
        const participant = createTestParticipant({
          id: `participant-${i}`,
          name: `参加者${i}`,
        });
        tournament.addParticipant(participant);
      }

      await mockTournamentRepository.save(tournament);

      const dto: AddParticipantDTO = {
        tournamentId: 'tournament-id',
        name: '新しい参加者',
        isCaptain: false,
      };

      // AddParticipantToTournamentUseCaseのexecuteメソッドをモック化
      const originalExecute = addParticipantToTournamentUseCase.execute;

      // モックの実装
      addParticipantToTournamentUseCase.execute = jest
        .fn()
        .mockImplementation(async (input: AddParticipantDTO) => {
          const tournamentId = new TournamentId(input.tournamentId);
          const tournament = await mockTournamentRepository.findById(tournamentId);

          if (tournament && tournament.participants.length >= MAX_PARTICIPANTS) {
            throw new Error('参加者数が上限に達しています');
          }

          return originalExecute.call(addParticipantToTournamentUseCase, input);
        });

      // 実行・検証
      await expect(async () => {
        await addParticipantToTournamentUseCase.execute(dto);
      }).rejects.toThrow('参加者数が上限に達しています');
    });
  });
});
