// __tests__/client/tournament/createTournament.test.ts
// createTournamentのユニットテスト
import { createTournament, CreateTournamentInput } from '@/client/tournament/createTournament';
import { createClient } from 'urql';

jest.mock('urql');

const mockMutation = jest.fn();
(createClient as jest.Mock).mockReturnValue({ mutation: mockMutation });

describe('createTournament', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正常に大会作成できる', async () => {
    const tournament = {
      id: '1',
      name: '大会A',
      createdAt: '2025-04-18T07:00:00Z',
      participants: [],
      teams: [],
      draftStatus: null,
    };
    mockMutation.mockReturnValue({
      toPromise: () => Promise.resolve({ data: { createTournament: tournament } }),
    });
    const result = await createTournament({ name: '大会A' });
    expect(result).toEqual(tournament);
  });

  it('エラー時は例外を投げる', async () => {
    mockMutation.mockReturnValue({
      toPromise: () => Promise.resolve({ error: new Error('作成失敗') }),
    });
    await expect(createTournament({ name: '大会B' })).rejects.toThrow('作成失敗');
  });
});
