// Participantエンティティのテスト
// コメントは日本語で記載
import { Participant } from '@/app/api/core/domain/entities/Participant';

describe('Participantエンティティ', () => {
  // createメソッドのテスト
  it('createでインスタンス生成できる', () => {
    const participant = Participant.create('テスト太郎', 'スプラシューター', 2500);
    expect(participant).toBeInstanceOf(Participant);
    expect(participant.name).toBe('テスト太郎');
    expect(participant.weapon).toBe('スプラシューター');
    expect(participant.xp).toBe(2500);
    expect(participant.createdAt).toBeInstanceOf(Date);
    expect(participant.teamId).toBeNull();
  });

  // reconstructメソッドのテスト
  it('reconstructでインスタンス復元できる', () => {
    const now = new Date();
    const participant = Participant.reconstruct(
      'participant-id-1',
      '復元太郎',
      'バレルスピナー',
      3000,
      now,
      'team-id-1'
    );
    expect(participant).toBeInstanceOf(Participant);
    expect(participant.id.value).toBe('participant-id-1');
    expect(participant.name).toBe('復元太郎');
    expect(participant.weapon).toBe('バレルスピナー');
    expect(participant.xp).toBe(3000);
    expect(participant.createdAt).toBe(now);
    expect(participant.teamId?.value).toBe('team-id-1');
  });
});
