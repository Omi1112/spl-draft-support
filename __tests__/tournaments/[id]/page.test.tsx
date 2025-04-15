import { render, screen } from '@testing-library/react';
import React from 'react';

import { useTournamentDetails } from '../../../app/tournaments/[id]/hooks/useTournamentDetails';
import TournamentDetails from '../../../app/tournaments/[id]/page';

// Next.jsのuseParamsフックをモック
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-tournament-id' }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// カスタムフックをモック
jest.mock('../../../app/tournaments/[id]/hooks/useTournamentDetails');

// formatDateをモック
jest.mock('../../../app/utils/formatDate', () => ({
  formatDate: jest.fn(() => '2025年4月7日'),
}));

describe('TournamentDetails', () => {
  // デフォルトのモックデータ
  const mockTournament = {
    id: 'test-tournament-id',
    name: 'テスト大会',
    createdAt: '2025-04-07T00:00:00.000Z',
    participants: [
      {
        id: 'p1',
        name: 'テスト参加者1',
        weapon: 'シューター',
        xp: 2000,
        createdAt: '2025-04-06T00:00:00.000Z',
        isCaptain: true,
      },
      {
        id: 'p2',
        name: 'テスト参加者2',
        weapon: 'チャージャー',
        xp: 2200,
        createdAt: '2025-04-06T00:00:00.000Z',
        isCaptain: false,
      },
    ],
    teams: [
      {
        id: 'team1',
        name: 'チームA',
        captainId: 'p1',
        members: [
          {
            id: 'p1',
            name: 'テスト参加者1',
            weapon: 'シューター',
            xp: 2000,
            createdAt: '2025-04-06T00:00:00.000Z',
          },
          {
            id: 'p2',
            name: 'テスト参加者2',
            weapon: 'チャージャー',
            xp: 2200,
            createdAt: '2025-04-06T00:00:00.000Z',
          },
        ],
        captain: {
          id: 'p1',
          name: 'テスト参加者1',
          weapon: 'シューター',
          xp: 2000,
          createdAt: '2025-04-06T00:00:00.000Z',
        },
        tournamentId: 'test-tournament-id',
        createdAt: '2025-04-07T00:00:00.000Z',
      },
    ],
    captains: [
      {
        id: 'p1',
        name: 'テスト参加者1',
        weapon: 'シューター',
        xp: 2000,
        createdAt: '2025-04-06T00:00:00.000Z',
      },
    ],
  };

  // テスト用のtournamentParticipantsを追加
  const mockTournamentWithParticipants = {
    ...mockTournament,
    tournamentParticipants: [
      { id: 'tp1', participant: mockTournament.participants[0] },
      { id: 'tp2', participant: mockTournament.participants[1] },
    ],
  };

  // モックの関数
  const mockSetShowModal = jest.fn();
  const mockHandleCaptainToggle = jest.fn();
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn();

  beforeEach(() => {
    // デフォルトの成功ケースをモック
    (useTournamentDetails as jest.Mock).mockReturnValue({
      tournament: mockTournamentWithParticipants,
      loading: false,
      error: null,
      showModal: false,
      setShowModal: mockSetShowModal,
      participantForm: {
        name: '',
        weapon: '',
        xp: '',
      },
      isSubmitting: false,
      submitError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
      handleCaptainToggle: mockHandleCaptainToggle,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('データ読み込み中にLoadingStateを表示すること', () => {
    (useTournamentDetails as jest.Mock).mockReturnValue({
      tournament: null,
      loading: true,
      error: null,
      showModal: false,
      setShowModal: mockSetShowModal,
      participantForm: {
        name: '',
        weapon: '',
        xp: '',
      },
      isSubmitting: false,
      submitError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
      handleCaptainToggle: mockHandleCaptainToggle,
    });

    render(<TournamentDetails />);

    expect(screen.getByText('ロード中...')).toBeInTheDocument();
  });

  it('エラーが発生した場合にErrorStateを表示すること', () => {
    const errorMessage = '大会データの取得中にエラーが発生しました。';
    (useTournamentDetails as jest.Mock).mockReturnValue({
      tournament: null,
      loading: false,
      error: errorMessage,
      showModal: false,
      setShowModal: mockSetShowModal,
      participantForm: {
        name: '',
        weapon: '',
        xp: '',
      },
      isSubmitting: false,
      submitError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
      handleCaptainToggle: mockHandleCaptainToggle,
    });

    render(<TournamentDetails />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('大会の詳細情報が正しく表示されること', () => {
    render(<TournamentDetails />);

    // ヘッダー情報
    expect(screen.getByText('テスト大会')).toBeInTheDocument();
    // より具体的なセレクタを使用して最初の作成日のみを選択
    expect(screen.getAllByText('作成日: 2025年4月7日')[0]).toBeInTheDocument();

    // 大会ID
    expect(screen.getByText(/大会ID: test-tournament-id/)).toBeInTheDocument();

    // 参加者数
    expect(screen.getByText(/参加者数: 2人/)).toBeInTheDocument();

    // チーム情報
    expect(screen.getByText('チームA')).toBeInTheDocument();

    // 参加者情報 - より具体的なセレクタを使用
    expect(screen.getByRole('cell', { name: 'テスト参加者1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'テスト参加者2' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'シューター' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'チャージャー' })).toBeInTheDocument();

    // 「トップページへ戻る」リンク
    const backLink = screen.getByText('← トップページへ戻る');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('「参加者を追加」ボタンをクリックするとsetShowModalが呼ばれること', () => {
    render(<TournamentDetails />);

    const addButton = screen.getByText('参加者を追加');
    addButton.click();

    expect(mockSetShowModal).toHaveBeenCalledWith(true);
  });

  it('tournamentがnullの場合に何も表示されないこと', () => {
    (useTournamentDetails as jest.Mock).mockReturnValue({
      tournament: null,
      loading: false,
      error: null,
      showModal: false,
      setShowModal: mockSetShowModal,
      participantForm: {
        name: '',
        weapon: '',
        xp: '',
      },
      isSubmitting: false,
      submitError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
      handleCaptainToggle: mockHandleCaptainToggle,
    });

    const { container } = render(<TournamentDetails />);

    // 何も表示されていないことを確認
    expect(container.firstChild).toBeNull();
  });
});
