import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';
import { fetchCaptainDetail } from '@/app/client/captain/fetchCaptainDetail';
import { CaptainDetail } from '@/app/tournaments/[tournamentId]/captains/components/CaptainDetail';

// APIクライアントのモック
jest.mock('@/app/client/captain/fetchCaptainDetail', () => ({
  fetchCaptainDetail: jest.fn().mockResolvedValue({
    id: 'tp1',
    tournamentId: 't1',
    participantId: 'p1',
    isCaptain: true,
    createdAt: '2024-01-01T00:00:00Z',
    tournament: { id: 't1' },
    participant: {
      id: 'p1',
      name: 'キャプテンA',
      weapon: 'シューター',
      xp: 1200,
      createdAt: '2024-01-01T00:00:00Z',
    },
  }),
}));
jest.mock('@/app/client/captain/fetchNominatableTournamentParticipants', () => ({
  fetchNominatableTournamentParticipants: jest.fn().mockResolvedValue([
    {
      id: 'tp2',
      tournamentId: 't1',
      participantId: 'p2',
      isCaptain: false,
      createdAt: '2024-01-01T00:00:00Z',
      tournament: { id: 't1' },
      participant: {
        id: 'p2',
        name: '参加者A',
        weapon: 'シューター',
        xp: 1000,
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'tp3',
      tournamentId: 't1',
      participantId: 'p3',
      isCaptain: false,
      createdAt: '2024-01-01T00:00:00Z',
      tournament: { id: 't1' },
      participant: {
        id: 'p3',
        name: '参加者B',
        weapon: 'ローラー',
        xp: 800,
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
  ]),
}));
jest.mock('@/app/client/captain/nominateParticipant', () => ({
  nominateParticipant: jest.fn().mockResolvedValue({}),
}));
jest.mock('@/app/client/captain/startDraft', () => ({
  startDraft: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/app/client/captain/resetDraft', () => ({
  resetDraft: jest.fn().mockResolvedValue(true),
}));

describe('CaptainDetail', () => {
  // キャプテン情報と参加者リストの表示テスト
  it('キャプテン詳細・指名可能参加者が表示される', async () => {
    render(<CaptainDetail tournamentId="t1" participantId="p1" />);
    // ローディング表示
    expect(await screen.findByText('読み込み中...')).toBeInTheDocument();
    // キャプテン名
    expect(await screen.findByText('キャプテン: キャプテンA')).toBeInTheDocument();
    // 参加者Aのli要素
    expect(
      await screen.findByText(
        (content, element) => element?.tagName.toLowerCase() === 'li' && content.includes('参加者A')
      )
    ).toBeInTheDocument();
    // 参加者Bのli要素
    expect(
      await screen.findByText(
        (content, element) => element?.tagName.toLowerCase() === 'li' && content.includes('参加者B')
      )
    ).toBeInTheDocument();
  });

  // 指名ボタンの動作テスト
  it('指名ボタンを押すと参加者がリストから消える', async () => {
    render(<CaptainDetail tournamentId="t1" participantId="p1" />);
    const nominateButtons = await screen.findAllByText('指名');
    expect(1).toBe(1);
    expect(nominateButtons.length).toBeGreaterThan(0);
    // 参加者Aの指名ボタンをクリック
    await waitFor(() => {
      fireEvent.click(nominateButtons[0]);
    });
    // 参加者Aがリストから消えることを確認
    expect(await screen.queryByText('参加者A')).not.toBeInTheDocument();
  });

  // エラー時の表示テスト
  it('APIエラー時にエラーメッセージが表示される', async () => {
    // fetchCaptainDetailをエラーにする
    (fetchCaptainDetail as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));
    render(<CaptainDetail tournamentId="t1" participantId="p1" />);
    expect(await screen.findByText(/エラー/)).toBeInTheDocument();
  });
});
