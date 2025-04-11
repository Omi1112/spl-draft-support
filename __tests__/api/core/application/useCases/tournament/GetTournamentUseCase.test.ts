import { GetTournamentUseCase } from '../../../../../../app/api/core/application/useCases/tournament/GetTournamentUseCase';
import { TournamentRepository } from '../../../../../../app/api/core/domain/repositories/TournamentRepository';
import { ParticipantRepository } from '../../../../../../app/api/core/domain/repositories/ParticipantRepository';
import { TeamRepository } from '../../../../../../app/api/core/domain/repositories/TeamRepository';
import { createTestTournament } from '../../../../testHelpers/factories';

describe('GetTournamentUseCase', () => {
  let mockTournamentRepository: jest.Mocked<TournamentRepository>;
  let mockParticipantRepository: jest.Mocked<ParticipantRepository>;
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let getTournamentUseCase: GetTournamentUseCase;

  beforeEach(() => {
    mockTournamentRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      deleteByTournamentId: jest.fn(),
    } as jest.Mocked<TournamentRepository>;

    mockParticipantRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByTournamentId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ParticipantRepository>;

    mockTeamRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByTournamentId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      deleteByTournamentId: jest.fn(),
    } as jest.Mocked<TeamRepository>;

    getTournamentUseCase = new GetTournamentUseCase(
      mockTournamentRepository,
      mockParticipantRepository,
      mockTeamRepository
    );
  });

  it('存在するトーナメントを取得できること', async () => {
    const testTournament = createTestTournament({
      id: 'test-tournament-id',
      name: 'テストトーナメント',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
    });

    mockTournamentRepository.findById.mockResolvedValue(testTournament);
    mockParticipantRepository.findByTournamentId.mockResolvedValue([]);
    mockTeamRepository.findByTournamentId.mockResolvedValue([]);

    const result = await getTournamentUseCase.execute('test-tournament-id');

    expect(mockTournamentRepository.findById).toHaveBeenCalled();
    if (result === null) {
      fail('トーナメントがnullです');
    }
    expect(result.id).toBe('test-tournament-id');
    expect(result.name).toBe('テストトーナメント');
    expect(result.createdAt).toBeDefined();
  });

  it('存在しないトーナメントの場合はnullが返ること', async () => {
    mockTournamentRepository.findById.mockResolvedValue(null);

    const result = await getTournamentUseCase.execute('non-existent-id');

    expect(mockTournamentRepository.findById).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
