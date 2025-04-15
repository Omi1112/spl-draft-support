// TournamentParticipantエンティティのテスト
// コメントは日本語で記載
import { TournamentParticipant } from '@/app/api/core/domain/entities/TournamentParticipant';
import { TournamentParticipantId } from '@/app/api/core/domain/valueObjects/TournamentParticipantId';
import { TournamentId } from '@/app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '@/app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '@/app/api/core/domain/valueObjects/TeamId';

describe('TournamentParticipantエンティティ', () => {
  // createメソッドのテスト
  it('createでインスタンス生成できる', () => {
    const tournamentId = TournamentId.reconstruct('tournament-1');
    const participantId = ParticipantId.reconstruct('participant-1');
    const teamId = TeamId.reconstruct('team-1');
    const tp = TournamentParticipant.create(tournamentId, participantId, true, teamId);
    expect(tp).toBeInstanceOf(TournamentParticipant);
    expect(tp.tournamentId.value).toBe('tournament-1');
    expect(tp.participantId.value).toBe('participant-1');
    expect(tp.isCaptain).toBe(true);
    expect(tp.teamId?.value).toBe('team-1');
    expect(tp.createdAt).toBeInstanceOf(Date);
  });

  // reconstructメソッドのテスト
  it('reconstructでインスタンス復元できる', () => {
    const now = new Date();
    const tp = TournamentParticipant.reconstruct(
      'tp-1',
      'tournament-2',
      'participant-2',
      false,
      'team-2',
      now
    );
    expect(tp).toBeInstanceOf(TournamentParticipant);
    expect(tp.id.value).toBe('tp-1');
    expect(tp.tournamentId.value).toBe('tournament-2');
    expect(tp.participantId.value).toBe('participant-2');
    expect(tp.isCaptain).toBe(false);
    expect(tp.teamId?.value).toBe('team-2');
    expect(tp.createdAt).toBe(now);
  });

  // toggleCaptainFlag, assignTeam, hasSameIdentityのテスト
  it('toggleCaptainFlag/assignTeam/hasSameIdentityが正しく動作する', () => {
    const tournamentId = TournamentId.reconstruct('tournament-3');
    const participantId = ParticipantId.reconstruct('participant-3');
    const tp = TournamentParticipant.create(tournamentId, participantId, false, null);
    // toggleCaptainFlag
    tp.toggleCaptainFlag();
    expect(tp.isCaptain).toBe(true);
    tp.toggleCaptainFlag();
    expect(tp.isCaptain).toBe(false);
    // assignTeam
    const teamId = TeamId.reconstruct('team-3');
    tp.assignTeam(teamId);
    expect(tp.teamId?.value).toBe('team-3');
    tp.assignTeam(null);
    expect(tp.teamId).toBeNull();
    // hasSameIdentity
    expect(tp.hasSameIdentity(tournamentId, participantId)).toBe(true);
    const otherTournamentId = TournamentId.reconstruct('other-tournament');
    expect(tp.hasSameIdentity(otherTournamentId, participantId)).toBe(false);
  });
});
