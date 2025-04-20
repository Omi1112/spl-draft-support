// Teamエンティティのテスト
// コメントは日本語で記載
import { Team } from '@/app/api/core/domain/entities/Team';
import { ParticipantId } from '@/app/api/core/domain/valueObjects/ParticipantId';
import { TournamentId } from '@/app/api/core/domain/valueObjects/TournamentId';

describe('Teamエンティティ', () => {
  // createメソッドのテスト
  it('createでインスタンス生成できる', () => {
    const captainId = ParticipantId.reconstruct('captain-1');
    const tournamentId = TournamentId.reconstruct('tournament-1');
    const team = Team.create('チームA', captainId, tournamentId);
    expect(team).toBeInstanceOf(Team);
    expect(team.name).toBe('チームA');
    expect(team.captainId.value).toBe('captain-1');
    expect(team.tournamentId.value).toBe('tournament-1');
    expect(team.memberIds.length).toBe(1);
    expect(team.memberIds[0].value).toBe('captain-1');
    expect(team.isDeleted).toBe(false);
    expect(team.createdAt).toBeInstanceOf(Date);
  });

  // reconstructメソッドのテスト
  it('reconstructでインスタンス復元できる', () => {
    const now = new Date();
    const team = Team.reconstruct(
      'team-1',
      'チームB',
      'captain-2',
      'tournament-2',
      ['captain-2', 'member-1'],
      now.toISOString(),
      true
    );
    expect(team).toBeInstanceOf(Team);
    expect(team.id.value).toBe('team-1');
    expect(team.name).toBe('チームB');
    expect(team.captainId.value).toBe('captain-2');
    expect(team.tournamentId.value).toBe('tournament-2');
    expect(team.memberIds.length).toBe(2);
    expect(team.memberIds[0].value).toBe('captain-2');
    expect(team.memberIds[1].value).toBe('member-1');
    expect(team.isDeleted).toBe(true);
    expect(team.createdAt.toISOString()).toBe(now.toISOString());
  });

  // メンバー追加・削除・キャプテン変更・isMember・deleteのテスト
  it('addMember/removeMember/changeCaptain/isMember/deleteが正しく動作する', () => {
    const captainId = ParticipantId.reconstruct('captain-3');
    const memberId = ParticipantId.reconstruct('member-2');
    const newCaptainId = ParticipantId.reconstruct('new-captain');
    const tournamentId = TournamentId.reconstruct('tournament-3');
    const team = Team.create('チームC', captainId, tournamentId);
    // メンバー追加
    team.addMember(memberId);
    expect(team.memberIds.some((id) => id.value === 'member-2')).toBe(true);
    // isMember
    expect(team.isMember(memberId)).toBe(true);
    // キャプテン変更
    team.changeCaptain(newCaptainId);
    expect(team.captainId.value).toBe('new-captain');
    expect(team.isMember(newCaptainId)).toBe(true);
    // メンバー削除（キャプテンは削除不可）
    team.removeMember(newCaptainId);
    expect(team.isMember(newCaptainId)).toBe(true);
    // メンバー削除（通常メンバーは削除可）
    team.removeMember(memberId);
    expect(team.isMember(memberId)).toBe(false);
    // 削除フラグ
    team.delete();
    expect(team.isDeleted).toBe(true);
  });
});
