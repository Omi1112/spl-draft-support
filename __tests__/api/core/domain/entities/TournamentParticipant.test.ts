// filepath: /workspace/__tests__/api/core/domain/entities/TournamentParticipant.test.ts
import { TournamentParticipant } from '../../../../../app/api/core/domain/entities/TournamentParticipant';
import { TournamentParticipantId } from '../../../../../app/api/core/domain/valueObjects/TournamentParticipantId';
import { TournamentId } from '../../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../../app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '../../../../../app/api/core/domain/valueObjects/TeamId';

describe('TournamentParticipant エンティティ', () => {
  // テストデータ
  const id = new TournamentParticipantId('tp-1');
  const tournamentId = new TournamentId('tour-1');
  const participantId = new ParticipantId('part-1');
  const teamId = new TeamId('team-1');
  const createdAt = new Date();

  it('正しく初期化できること', () => {
    // 準備・実行
    const tournamentParticipant = new TournamentParticipant(
      id,
      tournamentId,
      participantId,
      true, // キャプテン
      teamId,
      createdAt
    );

    // 検証
    expect(tournamentParticipant.id).toBe(id);
    expect(tournamentParticipant.tournamentId).toBe(tournamentId);
    expect(tournamentParticipant.participantId).toBe(participantId);
    expect(tournamentParticipant.isCaptain).toBe(true);
    expect(tournamentParticipant.teamId).toBe(teamId);
    expect(tournamentParticipant.createdAt).toBe(createdAt);
  });

  it('キャプテン設定を更新できること', () => {
    // 準備
    const tournamentParticipant = new TournamentParticipant(
      id,
      tournamentId,
      participantId,
      true, // 最初はキャプテン
      teamId,
      createdAt
    );

    // 実行
    tournamentParticipant.toggleCaptainFlag();

    // 検証
    expect(tournamentParticipant.isCaptain).toBe(false);

    // キャプテンに戻す
    tournamentParticipant.toggleCaptainFlag();
    expect(tournamentParticipant.isCaptain).toBe(true);
  });

  it('チームの割り当てを変更できること', () => {
    // 準備
    const tournamentParticipant = new TournamentParticipant(
      id,
      tournamentId,
      participantId,
      true,
      teamId,
      createdAt
    );

    // 実行
    const newTeamId = new TeamId('team-2');
    tournamentParticipant.assignTeam(newTeamId);

    // 検証
    expect(tournamentParticipant.teamId).toBe(newTeamId);

    // チームの割り当てを解除
    tournamentParticipant.assignTeam(null);
    expect(tournamentParticipant.teamId).toBeNull();
  });
});
