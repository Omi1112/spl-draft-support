import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { AddParticipantForm } from '@/app/tournaments/components/AddParticipantForm';
import { GoToCaptainPageButton } from '@/app/tournaments/components/GoToCaptainPageButton';
import { ToggleCaptainButton } from '@/app/tournaments/components/ToggleCaptainButton';
import { TournamentDetail } from '@/app/tournaments/components/TournamentDetail';

// fetchTournamentParticipantsをモック
jest.mock('@/app/client/tournament/fetchTournamentParticipants', () => ({
  fetchTournamentParticipants: jest.fn().mockResolvedValue([
    {
      id: '1',
      tournamentId: 't1',
      participantId: 'p1',
      isCaptain: true,
      createdAt: '2024-01-01T00:00:00Z',
      Participant: {
        id: 'p1',
        name: '参加者A',
        weapon: 'シューター',
        xp: 1000,
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: '2',
      tournamentId: 't1',
      participantId: 'p2',
      isCaptain: false,
      createdAt: '2024-01-01T00:00:00Z',
      Participant: {
        id: 'p2',
        name: '参加者B',
        weapon: 'ローラー',
        xp: 800,
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
  ]),
}));

describe('TournamentDetail', () => {
  it('参加者一覧が表示される', async () => {
    render(<TournamentDetail tournamentId="t1" />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    expect(
      await screen.findByText(
        (content, element) => element?.tagName.toLowerCase() === 'li' && content.includes('参加者A')
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (content, element) => element?.tagName.toLowerCase() === 'li' && content.includes('参加者B')
      )
    ).toBeInTheDocument();
  });
});

describe('AddParticipantForm', () => {
  it('未入力でバリデーションエラー', async () => {
    render(<AddParticipantForm tournamentId="t1" />);
    fireEvent.click(screen.getByText('追加'));
    expect(await screen.findByText('全ての項目を入力してください')).toBeInTheDocument();
  });
});

describe('ToggleCaptainButton', () => {
  it('キャプテンにするボタンが表示される', () => {
    render(<ToggleCaptainButton tournamentId="t1" participantId="p2" isCaptain={false} />);
    expect(screen.getByText('キャプテンにする')).toBeInTheDocument();
  });
});

describe('GoToCaptainPageButton', () => {
  it('キャプテンページへボタンが表示される', () => {
    render(<GoToCaptainPageButton captainId="p1" />);
    expect(screen.getByText('キャプテンページへ')).toBeInTheDocument();
  });
});
