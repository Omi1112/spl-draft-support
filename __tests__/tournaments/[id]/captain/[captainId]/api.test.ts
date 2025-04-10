import {
  fetchTournamentData,
  startDraft,
  resetDraft,
  nominateParticipant,
  updateDraftStatus,
} from '../../../../../app/tournaments/[id]/captain/[captainId]/api';
import { TournamentDataResponse } from '../../../../../app/tournaments/[id]/captain/[captainId]/types';

// グローバルfetch関数をモック化
global.fetch = jest.fn();

describe('Captain API', () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    jest.clearAllMocks();
  });

  describe('fetchTournamentData', () => {
    it('大会データとキャプテン情報を取得すること', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        data: {
          tournament: {
            id: 'tournament-1',
            name: 'テスト大会',
            createdAt: '2025-04-07T00:00:00.000Z',
            teams: [],
            draftStatus: {
              round: 1,
              turn: 1,
            },
          },
          participants: [
            {
              id: 'captain-1',
              name: 'キャプテン1',
              weapon: 'シューター',
              xp: 2000,
              createdAt: '2025-04-06T00:00:00.000Z',
              isCaptain: true,
              team: null,
            },
            {
              id: 'participant-1',
              name: '参加者1',
              weapon: 'チャージャー',
              xp: 2200,
              createdAt: '2025-04-06T00:00:00.000Z',
              isCaptain: false,
              team: null,
            },
            {
              id: 'participant-2',
              name: '参加者2',
              weapon: 'ブラスター',
              xp: 2300,
              createdAt: '2025-04-06T00:00:00.000Z',
              isCaptain: false,
              team: {
                id: 'team-1',
                name: 'チーム1',
              },
            },
          ],
          captainDrafts: [],
          allDrafts: [],
        },
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      // 関数を実行
      const tournamentId = 'tournament-1';
      const captainId = 'captain-1';
      const result = await fetchTournamentData(tournamentId, captainId);

      // fetchが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(tournamentId),
      });

      // 結果が正しい形式であることを確認
      expect(result).toEqual({
        tournament: mockResponse.data.tournament,
        captain: mockResponse.data.participants[0],
        participants: [mockResponse.data.participants[1]], // チームに所属していない参加者だけ
        drafts: [],
        allDrafts: [],
        draftStatus: {
          round: 1,
          turn: 1,
        },
      });
    });

    it('エラーが含まれる場合は例外をスローすること', async () => {
      // エラーを含むレスポンスを設定
      const mockErrorResponse = {
        errors: [{ message: 'データの取得に失敗しました' }],
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockErrorResponse,
      });

      // 関数の呼び出しでエラーがスローされることを確認
      await expect(fetchTournamentData('tournament-1', 'captain-1')).rejects.toThrow(
        'データの取得に失敗しました'
      );
    });

    it('データが見つからない場合は例外をスローすること', async () => {
      // 不完全なレスポンスを設定
      const mockIncompleteResponse = {
        data: {
          // tournamentやparticipantsが含まれていない
        },
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockIncompleteResponse,
      });

      // 関数の呼び出しでエラーがスローされることを確認
      await expect(fetchTournamentData('tournament-1', 'captain-1')).rejects.toThrow(
        '大会またはキャプテンのデータが見つかりませんでした'
      );
    });

    it('キャプテンが見つからない場合は例外をスローすること', async () => {
      // キャプテンが含まれていないレスポンスを設定
      const mockNoMatchingCaptainResponse = {
        data: {
          tournament: {
            id: 'tournament-1',
            name: 'テスト大会',
            createdAt: '2025-04-07T00:00:00.000Z',
            teams: [],
            draftStatus: null,
          },
          participants: [
            {
              id: 'participant-1',
              name: '参加者1',
              weapon: 'チャージャー',
              xp: 2200,
              createdAt: '2025-04-06T00:00:00.000Z',
              isCaptain: false,
              team: null,
            },
          ],
          captainDrafts: [],
          allDrafts: [],
        },
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockNoMatchingCaptainResponse,
      });

      // 関数の呼び出しでエラーがスローされることを確認
      await expect(fetchTournamentData('tournament-1', 'captain-1')).rejects.toThrow(
        '指定されたキャプテンが見つかりませんでした'
      );
    });
  });

  describe('startDraft', () => {
    it('ドラフトを開始すること', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        data: {
          startDraft: [
            {
              id: 'team-1',
              name: 'キャプテン1のチーム',
              captainId: 'captain-1',
            },
          ],
        },
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      // 関数を実行
      const tournamentId = 'tournament-1';
      const result = await startDraft(tournamentId);

      // fetchが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(tournamentId),
      });

      // 結果が正しいことを確認
      expect(result).toEqual(mockResponse.data.startDraft);
    });

    it('エラーが含まれる場合は例外をスローすること', async () => {
      // エラーを含むレスポンスを設定
      const mockErrorResponse = {
        errors: [{ message: 'ドラフト開始エラー' }],
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockErrorResponse,
      });

      // 関数の呼び出しでエラーがスローされることを確認
      await expect(startDraft('tournament-1')).rejects.toThrow('ドラフト開始エラー');
    });
  });

  describe('resetDraft', () => {
    it('ドラフトをリセットすること', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        data: {
          resetDraft: true,
        },
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      // 関数を実行
      const tournamentId = 'tournament-1';
      const result = await resetDraft(tournamentId);

      // fetchが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(tournamentId),
      });

      // 結果が正しいことを確認
      expect(result).toBe(mockResponse.data.resetDraft);
    });

    it('エラーが含まれる場合は例外をスローすること', async () => {
      // エラーを含むレスポンスを設定
      const mockErrorResponse = {
        errors: [{ message: 'ドラフトリセットエラー' }],
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockErrorResponse,
      });

      // 関数の呼び出しでエラーがスローされることを確認
      await expect(resetDraft('tournament-1')).rejects.toThrow('ドラフトリセットエラー');
    });
  });

  describe('nominateParticipant', () => {
    it('参加者を指名すること', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        data: {
          nominateParticipant: {
            id: 'draft-1',
            status: 'pending',
          },
        },
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      // 関数を実行
      const tournamentId = 'tournament-1';
      const captainId = 'captain-1';
      const participantId = 'participant-1';
      const result = await nominateParticipant(tournamentId, captainId, participantId);

      // fetchが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(participantId),
      });

      // 結果が正しいことを確認
      expect(result).toEqual(mockResponse.data.nominateParticipant);
    });

    it('エラーが含まれる場合は例外をスローすること', async () => {
      // エラーを含むレスポンスを設定
      const mockErrorResponse = {
        errors: [{ message: '既にこの参加者を指名しています' }],
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockErrorResponse,
      });

      // 関数の呼び出しでエラーがスローされることを確認
      await expect(
        nominateParticipant('tournament-1', 'captain-1', 'participant-1')
      ).rejects.toThrow('既にこの参加者を指名しています');
    });
  });

  describe('updateDraftStatus', () => {
    it('指名ステータスを更新すること', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        data: {
          updateDraftStatus: {
            id: 'draft-1',
            status: 'confirmed',
          },
        },
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      // 関数を実行
      const draftId = 'draft-1';
      const status = 'confirmed';
      const result = await updateDraftStatus(draftId, status);

      // fetchが正しく呼び出されたことを確認
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(draftId),
      });

      // 結果が正しいことを確認
      expect(result).toEqual(mockResponse.data.updateDraftStatus);
    });

    it('エラーが含まれる場合は例外をスローすること', async () => {
      // エラーを含むレスポンスを設定
      const mockErrorResponse = {
        errors: [{ message: '無効な指名ステータスです' }],
      };

      // fetch呼び出しのレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockErrorResponse,
      });

      // 関数の呼び出しでエラーがスローされることを確認
      await expect(updateDraftStatus('draft-1', 'invalid_status')).rejects.toThrow(
        '無効な指名ステータスです'
      );
    });
  });
});
