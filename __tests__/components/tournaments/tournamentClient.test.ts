import {
  fetchTournament,
  addParticipantToTournament,
  toggleCaptain,
} from '../../../app/client/tournamentClient';

// fetchをモック
global.fetch = jest.fn();

describe('tournamentClient', () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    (global.fetch as jest.Mock).mockReset();
  });

  describe('fetchTournament', () => {
    it('大会データを正しく取得できること', async () => {
      // モックデータ
      const mockTournamentData = {
        id: 'tournament-1',
        name: 'テスト大会',
        createdAt: '2025-04-07T00:00:00.000Z',
        participants: [
          {
            id: 'p1',
            name: '参加者1',
            weapon: '武器1',
            xp: 2000,
            createdAt: '2025-04-06T00:00:00.000Z',
          },
        ],
        captains: [{ id: 'p1', name: '参加者1', weapon: '武器1', xp: 2000 }],
        teams: [],
      };

      // 成功レスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          data: { tournament: mockTournamentData },
        }),
      });

      const result = await fetchTournament('tournament-1');

      // GraphQL APIが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('tournament-1'),
        })
      );

      // 返されたデータが正しいことを確認
      expect(result).toEqual(mockTournamentData);
    });

    it('GraphQLエラーが発生した場合、例外をスローすること', async () => {
      // GraphQLエラーをモック
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          errors: [{ message: 'GraphQL error: 大会が見つかりません' }],
        }),
      });

      await expect(fetchTournament('invalid-id')).rejects.toThrow(
        'GraphQL error: 大会が見つかりません'
      );
    });

    it('データが存在しない場合、例外をスローすること', async () => {
      // データなしの応答をモック
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          data: { tournament: null },
        }),
      });

      await expect(fetchTournament('not-found')).rejects.toThrow(
        '大会データが見つかりませんでした'
      );
    });
  });

  describe('addParticipantToTournament', () => {
    it('参加者を大会に正しく追加できること', async () => {
      // 参加者データ
      const participantData = {
        name: '新規参加者',
        weapon: 'シューター',
        xp: 2000,
      };

      // 成功レスポンスをモック
      const mockResponse = {
        id: 'tp1',
        tournamentId: 'tournament-1',
        participantId: 'p1',
        createdAt: '2025-04-07T00:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          data: { addParticipantToTournament: mockResponse },
        }),
      });

      const result = await addParticipantToTournament('tournament-1', participantData);

      // GraphQL APIが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('AddParticipantToTournament'),
        })
      );

      // リクエストボディに正しいデータが含まれていることを確認
      const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(requestBody.variables.input).toEqual({
        tournamentId: 'tournament-1',
        participant: participantData,
      });

      // 返されたデータが正しいことを確認
      expect(result).toEqual(mockResponse);
    });

    it('追加に失敗した場合、例外をスローすること', async () => {
      // エラーレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          errors: [{ message: 'GraphQL error: 参加者の追加に失敗しました' }],
        }),
      });

      const participantData = {
        name: '新規参加者',
        weapon: 'シューター',
        xp: 2000,
      };

      await expect(addParticipantToTournament('tournament-1', participantData)).rejects.toThrow(
        'GraphQL error: 参加者の追加に失敗しました'
      );
    });
  });

  describe('toggleCaptain', () => {
    it('主将を正しく設定できること', async () => {
      // 成功レスポンスをモック
      const mockResponse = {
        id: 'tp1',
        tournamentId: 'tournament-1',
        participantId: 'p1',
        isCaptain: true,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          data: { toggleCaptain: mockResponse },
        }),
      });

      const result = await toggleCaptain('tournament-1', 'p1');

      // GraphQL APIが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('ToggleCaptain'),
        })
      );

      // リクエストボディに正しいデータが含まれていることを確認
      const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(requestBody.variables.input).toEqual({
        tournamentId: 'tournament-1',
        participantId: 'p1',
      });

      // 返されたデータが正しいことを確認
      expect(result).toEqual(mockResponse);
    });

    it('主将設定に失敗した場合、例外をスローすること', async () => {
      // エラーレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          errors: [{ message: 'GraphQL error: 主将の設定に失敗しました' }],
        }),
      });

      await expect(toggleCaptain('tournament-1', 'p1')).rejects.toThrow(
        'GraphQL error: 主将の設定に失敗しました'
      );
    });
  });
});
