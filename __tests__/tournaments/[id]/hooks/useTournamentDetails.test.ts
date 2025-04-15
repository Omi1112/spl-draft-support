import { renderHook, act } from '@testing-library/react';

import { useCaptainManagement } from '../../../../app/tournaments/[id]/hooks/useCaptainManagement';
import { useParticipantForm } from '../../../../app/tournaments/[id]/hooks/useParticipantForm';
import { useTournamentData } from '../../../../app/tournaments/[id]/hooks/useTournamentData';
import { useTournamentDetails } from '../../../../app/tournaments/[id]/hooks/useTournamentDetails';

// 依存しているカスタムフックをモック
jest.mock('../../../../app/tournaments/[id]/hooks/useTournamentData', () => ({
  useTournamentData: jest.fn(),
}));

jest.mock('../../../../app/tournaments/[id]/hooks/useParticipantForm', () => ({
  useParticipantForm: jest.fn(),
}));

jest.mock('../../../../app/tournaments/[id]/hooks/useCaptainManagement', () => ({
  useCaptainManagement: jest.fn(),
}));

// モック関数の型アサーション
const mockUseTournamentData = useTournamentData as jest.Mock;
const mockUseParticipantForm = useParticipantForm as jest.Mock;
const mockUseCaptainManagement = useCaptainManagement as jest.Mock;

describe('useTournamentDetails', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();

    // モックの戻り値を設定
    mockUseTournamentData.mockReturnValue({
      tournament: { id: '1', name: 'テストトーナメント' },
      loading: false,
      error: null,
      refreshTournament: jest.fn(),
    });

    mockUseParticipantForm.mockReturnValue({
      showModal: false,
      setShowModal: jest.fn(),
      participantForm: { name: '', email: '' },
      isSubmitting: false,
      submitError: null,
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    });

    mockUseCaptainManagement.mockReturnValue({
      handleCaptainToggle: jest.fn(),
      isProcessing: false,
    });
  });

  it('正しく各フックを統合してデータを返すこと', () => {
    // フックをレンダリング
    const { result } = renderHook(() => useTournamentDetails('1'));

    // 期待される戻り値が含まれているか検証
    expect(result.current).toEqual({
      tournament: { id: '1', name: 'テストトーナメント' },
      loading: false,
      error: null,
      showModal: false,
      setShowModal: expect.any(Function),
      participantForm: { name: '', email: '' },
      isSubmitting: false,
      submitError: null,
      handleChange: expect.any(Function),
      handleSubmit: expect.any(Function),
      handleCaptainToggle: expect.any(Function),
      isProcessingCaptain: false,
      // ドラフトリセット関連のプロパティを追加
      isResetting: false,
      showConfirmDialog: false,
      resetError: null,
      handleResetClick: expect.any(Function),
      handleConfirmReset: expect.any(Function),
      handleCancelReset: expect.any(Function),
    });

    // 各フックが正しいパラメータで呼ばれたか検証
    expect(mockUseTournamentData).toHaveBeenCalledWith('1');
    expect(mockUseParticipantForm).toHaveBeenCalledWith(
      { id: '1', name: 'テストトーナメント' },
      expect.any(Function)
    );
    expect(mockUseCaptainManagement).toHaveBeenCalledWith(
      { id: '1', name: 'テストトーナメント' },
      expect.any(Function)
    );
  });

  it('ローディング状態が正しく反映されること', () => {
    // ローディング状態をモック
    mockUseTournamentData.mockReturnValue({
      tournament: null,
      loading: true,
      error: null,
      refreshTournament: jest.fn(),
    });

    const { result } = renderHook(() => useTournamentDetails('1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.tournament).toBeNull();
  });

  it('エラー状態が正しく反映されること', () => {
    // エラー状態をモック
    const testError = new Error('テストエラー');
    mockUseTournamentData.mockReturnValue({
      tournament: null,
      loading: false,
      error: testError,
      refreshTournament: jest.fn(),
    });

    const { result } = renderHook(() => useTournamentDetails('1'));

    expect(result.current.error).toBe(testError);
  });

  it('モーダル表示のトグルが機能すること', () => {
    // setShowModalのモック関数
    const mockSetShowModal = jest.fn();
    mockUseParticipantForm.mockReturnValue({
      showModal: false,
      setShowModal: mockSetShowModal,
      participantForm: { name: '', email: '' },
      isSubmitting: false,
      submitError: null,
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    });

    const { result } = renderHook(() => useTournamentDetails('1'));

    // モーダルを開く
    act(() => {
      result.current.setShowModal(true);
    });

    expect(mockSetShowModal).toHaveBeenCalledWith(true);
  });

  it('キャプテン管理機能が正しく動作すること', () => {
    // キャプテントグルのモック関数
    const mockHandleCaptainToggle = jest.fn();
    mockUseCaptainManagement.mockReturnValue({
      handleCaptainToggle: mockHandleCaptainToggle,
      isProcessing: false,
    });

    const { result } = renderHook(() => useTournamentDetails('1'));

    // キャプテントグル関数を呼び出し
    act(() => {
      result.current.handleCaptainToggle('participant1');
    });

    expect(mockHandleCaptainToggle).toHaveBeenCalledWith('participant1');
  });
});
