// filepath: /workspace/__tests__/api/core/domain/valueObjects/TournamentParticipantId.test.ts
import { TournamentParticipantId } from '../../../../../app/api/core/domain/valueObjects/TournamentParticipantId';

describe('TournamentParticipantId バリューオブジェクト', () => {
  it('正しく初期化できること', () => {
    // 準備・実行
    const id = new TournamentParticipantId('tp-123');

    // 検証
    expect(id.value).toBe('tp-123');
  });

  it('空の値で初期化するとエラーになること', () => {
    // 準備・実行・検証
    expect(() => new TournamentParticipantId('')).toThrow(
      'TournamentParticipantId value cannot be empty'
    );
  });

  it('同じ値を持つ2つのIDが等価であることを確認できること', () => {
    // 準備
    const id1 = new TournamentParticipantId('tp-123');
    const id2 = new TournamentParticipantId('tp-123');
    const id3 = new TournamentParticipantId('tp-456');

    // 実行・検証
    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });

  it('文字列表現を取得できること', () => {
    // 準備
    const id = new TournamentParticipantId('tp-123');

    // 実行・検証
    expect(id.toString()).toBe('tp-123');
  });
});
