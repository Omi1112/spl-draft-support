import { TournamentParticipant } from '../../../../../app/api/core/domain/entities/TournamentParticipant';
import { TournamentParticipantDomainService } from '../../../../../app/api/core/domain/services/TournamentParticipantDomainService';
import { TournamentParticipantId } from '../../../../../app/api/core/domain/valueObjects/TournamentParticipantId';
import { TournamentId } from '../../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../../app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '../../../../../app/api/core/domain/valueObjects/TeamId';
import { TournamentParticipantRepository } from '../../../../../app/api/core/domain/repositories/TournamentParticipantRepository';

describe('TournamentParticipantDomainService', () => {
  let domainService: TournamentParticipantDomainService;
  let mockRepository: jest.Mocked<TournamentParticipantRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByTournamentId: jest.fn(),
      findByTournamentAndParticipant: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findByParticipantId: jest.fn(),
      clearTeamReferences: jest.fn(),
    } as jest.Mocked<TournamentParticipantRepository>;

    domainService = new TournamentParticipantDomainService(mockRepository);
  });

  describe('toggleCaptainFlag', () => {
    it('キャプテンフラグをfalseからtrueに変更できること', () => {
      // 準備
      const participantId = new TournamentParticipantId('participant1');
      const tournamentId = new TournamentId('tournament1');
      const playerParticipantId = new ParticipantId('player1');
      const teamId = new TeamId('team1');
      const createdAt = new Date();

      const participant = new TournamentParticipant(
        participantId,
        tournamentId,
        playerParticipantId,
        false, // isCaptain = false
        teamId,
        createdAt
      );

      // 実行
      const updatedParticipant = domainService.toggleCaptainFlag(participant);

      // 検証
      expect(updatedParticipant.isCaptain).toBe(true);
      expect(updatedParticipant.id.value).toBe(participantId.value);
      expect(updatedParticipant.tournamentId.value).toBe(tournamentId.value);
      expect(updatedParticipant.participantId.value).toBe(playerParticipantId.value);
      expect(updatedParticipant.teamId?.value).toBe(teamId.value);
    });

    it('キャプテンフラグをtrueからfalseに変更できること', () => {
      // 準備
      const participantId = new TournamentParticipantId('participant1');
      const tournamentId = new TournamentId('tournament1');
      const playerParticipantId = new ParticipantId('player1');
      const teamId = new TeamId('team1');
      const createdAt = new Date();

      const participant = new TournamentParticipant(
        participantId,
        tournamentId,
        playerParticipantId,
        true, // isCaptain = true
        teamId,
        createdAt
      );

      // 実行
      const updatedParticipant = domainService.toggleCaptainFlag(participant);

      // 検証
      expect(updatedParticipant.isCaptain).toBe(false);
      expect(updatedParticipant.id.value).toBe(participantId.value);
      expect(updatedParticipant.tournamentId.value).toBe(tournamentId.value);
      expect(updatedParticipant.participantId.value).toBe(playerParticipantId.value);
      expect(updatedParticipant.teamId?.value).toBe(teamId.value);
    });
  });
});
