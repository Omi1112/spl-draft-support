// __tests__/client/tournament/fetchTournaments.test.ts
// fetchTournamentsのユニットテスト
import { fetchTournaments, Tournament } from '@/client/tournament/fetchTournaments';
import { createClient } from 'urql';

jest.mock('urql');

const mockQuery = jest.fn();
(createClient as jest.Mock).mockReturnValue({ query: mockQuery });

describe('fetchTournaments', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正常に大会一覧を取得できる', async () => {
    const tournaments: Tournament[] = [
      {
        id: '1',
        name: '大会1',
        createdAt: '2025-04-18T07:00:00Z',
        participants: [],
        teams: [],
        draftStatus: null,
      },
    ];
    mockQuery.mockReturnValue({ toPromise: () => Promise.resolve({ data: { tournaments } }) });
    const result = await fetchTournaments();
    expect(result).toEqual(tournaments);
  });

  it('エラー時は例外を投げる', async () => {
    mockQuery.mockReturnValue({
      toPromise: () => Promise.resolve({ error: new Error('取得失敗') }),
    });
    await expect(fetchTournaments()).rejects.toThrow('取得失敗');
  });

  it('データがない場合は空配列を返す', async () => {
    mockQuery.mockReturnValue({ toPromise: () => Promise.resolve({ data: { tournaments: [] } }) });
    const result = await fetchTournaments();
    expect(result).toEqual([]);
  });
});
