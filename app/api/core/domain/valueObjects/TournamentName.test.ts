// TournamentNameのテスト
import { TournamentName } from '@/app/api/core/domain/valueObjects/TournamentName';

describe('TournamentNameバリューオブジェクト', () => {
  // 正常系テスト
  it('正しい値でインスタンス作成できる', () => {
    const name = TournamentName.create('テスト大会');
    expect(name.value).toBe('テスト大会');
  });

  it('reconstructで正しく復元できる', () => {
    const name = TournamentName.reconstruct('復元大会');
    expect(name.value).toBe('復元大会');
  });

  it('equals()で同値比較できる', () => {
    const name1 = TournamentName.create('比較大会');
    const name2 = TournamentName.create('比較大会');
    const name3 = TournamentName.create('異なる大会');

    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
    expect(name1.equals(undefined)).toBe(false);
    expect(name1.equals(null)).toBe(false);
  });

  it('toString()で文字列に変換できる', () => {
    const name = TournamentName.create('文字列大会');
    expect(name.toString()).toBe('文字列大会');
  });

  // 異常系テスト
  it('空文字列でエラーになる', () => {
    expect(() => TournamentName.create('')).toThrow('大会名は必須です');
  });

  it('空白のみでエラーになる', () => {
    expect(() => TournamentName.create('   ')).toThrow('大会名は必須です');
  });

  // 最小長チェックのテスト
  it('最小文字数（3文字）未満でエラーになる', () => {
    expect(() => TournamentName.create('あ')).toThrow('大会名は3文字以上で入力してください');
    expect(() => TournamentName.create('ab')).toThrow('大会名は3文字以上で入力してください');
  });

  // 最大長チェックのテスト
  it('101文字以上でエラーになる', () => {
    const longName = 'a'.repeat(101);
    expect(() => TournamentName.create(longName)).toThrow('大会名は100文字以内で入力してください');
  });

  it('100文字ちょうどはエラーにならない', () => {
    const name = 'a'.repeat(100);
    const tournamentName = TournamentName.create(name);
    expect(tournamentName.value).toBe(name);
  });

  // 禁止文字チェックのテスト
  it('禁止文字を含むとエラーになる', () => {
    expect(() => TournamentName.create('テスト<大会>')).toThrow(
      '大会名に使用できない文字が含まれています'
    );
    expect(() => TournamentName.create('テスト{大会}')).toThrow(
      '大会名に使用できない文字が含まれています'
    );
    expect(() => TournamentName.create('テスト[大会]')).toThrow(
      '大会名に使用できない文字が含まれています'
    );
    expect(() => TournamentName.create('テスト\\大会')).toThrow(
      '大会名に使用できない文字が含まれています'
    );
    expect(() => TournamentName.create('テスト|大会')).toThrow(
      '大会名に使用できない文字が含まれています'
    );
    expect(() => TournamentName.create('テスト^大会')).toThrow(
      '大会名に使用できない文字が含まれています'
    );
    expect(() => TournamentName.create('テスト`大会')).toThrow(
      '大会名に使用できない文字が含まれています'
    );
  });

  // 空白トリミングのテスト
  it('先頭・末尾の空白は自動的に削除される', () => {
    const name = TournamentName.create('  トリミング大会  ');
    expect(name.value).toBe('トリミング大会');
  });
});
