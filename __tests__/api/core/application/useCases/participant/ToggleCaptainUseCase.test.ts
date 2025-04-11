import { ToggleCaptainUseCase } from '../../../../../../app/api/core/application/useCases/participant/ToggleCaptainUseCase';
import { TournamentRepository } from '../../../../../../app/api/core/domain/repositories/TournamentRepository';
import { TournamentParticipant } from '../../../../../../app/api/core/domain/entities/TournamentParticipant';
import { TournamentParticipantId } from '../../../../../../app/api/core/domain/valueObjects/TournamentParticipantId';
import { TournamentParticipantRepository } from '../../../../../../app/api/core/domain/repositories/TournamentParticipantRepository';
import { TournamentParticipantDomainService } from '../../../../../../app/api/core/domain/services/TournamentParticipantDomainService';
import { Tournament } from '../../../../../../app/api/core/domain/entities/Tournament';
import { TournamentId } from '../../../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../../../app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '../../../../../../app/api/core/domain/valueObjects/TeamId';

describe('ToggleCaptainUseCase', () => {
  const mockTournamentRepository: jest.Mocked<TournamentRepository> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    deleteByTournamentId: jest.fn(),
  } as jest.Mocked<TournamentRepository>;

  const mockTournamentParticipantRepository: jest.Mocked<TournamentParticipantRepository> = {
    findById: jest.fn(),
    findByTournamentId: jest.fn(),
    findByTournamentAndParticipant: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findByParticipantId: jest.fn(),
    clearTeamReferences: jest.fn(),
  } as jest.Mocked<TournamentParticipantRepository>;

  const tournamentParticipantDomainService = new TournamentParticipantDomainService(
    mockTournamentParticipantRepository
  );

  const useCase = new ToggleCaptainUseCase(
    mockTournamentRepository,
    tournamentParticipantDomainService
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('参加者のキャプテンフラグを正常に切り替えること', async () => {
    // 準備
    const tournamentId = new TournamentId('tournament1');
    const participantId = new ParticipantId('participant1');
    const teamId = new TeamId('team1');
    const createdAt = new Date();

    // トーナメントの準備
    const tournament = Tournament.reconstruct(
      'tournament1',
      'テストトーナメント',
      new Date(),
      ['participant1'],
      [],
      undefined
    );
    mockTournamentRepository.findById.mockResolvedValue(tournament);

    // 参加者の準備
    const participant = new TournamentParticipant(
      new TournamentParticipantId('tp1'),
      tournamentId,
      participantId,
      false,
      teamId,
      createdAt
    );

    mockTournamentParticipantRepository.findByTournamentAndParticipant.mockResolvedValue(
      participant
    );

    const updatedParticipant = new TournamentParticipant(
      new TournamentParticipantId('tp1'),
      tournamentId,
      participantId,
      true, // キャプテンに変更
      teamId,
      createdAt
    );
    mockTournamentParticipantRepository.save.mockResolvedValue(updatedParticipant);

    // 実行
    const result = await useCase.execute({
      tournamentId: 'tournament1',
      participantId: 'participant1',
    });

    // 検証
    expect(mockTournamentRepository.findById).toBeCalledWith(expect.any(TournamentId));
    expect(mockTournamentParticipantRepository.findByTournamentAndParticipant).toBeCalledWith(
      expect.any(TournamentId),
      expect.any(ParticipantId)
    );
    expect(mockTournamentParticipantRepository.save).toBeCalled();
    expect(result.id).toBe('tp1');
    expect(result.tournamentId).toBe('tournament1');
    expect(result.participantId).toBe('participant1');
    expect(result.isCaptain).toBe(true);
  });

  it('トーナメントが存在しない場合はエラーを投げること', async () => {
    // 準備
    mockTournamentRepository.findById.mockResolvedValue(null);

    // 実行と検証
    await expect(
      useCase.execute({
        tournamentId: 'nonexistent-id',
        participantId: 'participant1',
      })
    ).rejects.toThrow('トーナメントID nonexistent-id が見つかりません');
  });

  it('参加者が存在しない場合はエラーを投げること', async () => {
    // 準備
    const tournament = Tournament.reconstruct(
      'tournament1',
      'テストトーナメント',
      new Date(),
      [], // 参加者なし
      [],
      undefined
    );
    mockTournamentRepository.findById.mockResolvedValue(tournament);

    mockTournamentParticipantRepository.findByTournamentAndParticipant.mockResolvedValue(null);

    // 実行と検証
    await expect(
      useCase.execute({
        tournamentId: 'tournament1',
        participantId: 'participant1',
      })
    ).rejects.toThrow(/指定されたトーナメント.*と参加者.*の組み合わせが見つかりません/);
  });
});
