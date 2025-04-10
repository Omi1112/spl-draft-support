import { TournamentId } from '../../../../../app/api/core/domain/valueObjects/TournamentId';

describe('TournamentId', () => {
  it('valueプロパティを通じて値を取得できるべき', () => {
    const id = new TournamentId('test-id');
    expect(id.value).toBe('test-id');
  });

  it('同じ値を持つインスタンスは等価であるべき', () => {
    const id1 = new TournamentId('test-id');
    const id2 = new TournamentId('test-id');

    expect(id1.equals(id2)).toBe(true);
  });

  it('異なる値を持つインスタンスは等価ではないべき', () => {
    const id1 = new TournamentId('test-id-1');
    const id2 = new TournamentId('test-id-2');

    expect(id1.equals(id2)).toBe(false);
  });

  it('nullまたはundefinedとの比較はfalseを返すべき', () => {
    const id = new TournamentId('test-id');

    // 実際のコードがnull/undefinedのチェックを行っているかを確認
    expect(id.equals(null as unknown as TournamentId)).toBe(false);
    expect(id.equals(undefined as unknown as TournamentId)).toBe(false);
  });
});
