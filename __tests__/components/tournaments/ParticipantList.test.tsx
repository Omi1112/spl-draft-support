import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ParticipantList } from '../../../app/components/tournaments/ParticipantList';
import { Participant } from '../../../app/components/tournaments/types';

// モックを使用してNext.jsのLinkコンポーネントを置き換え
jest.mock('next/link', () => {
  return ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
});

describe('ParticipantList', () => {
  const mockParticipants: Participant[] = [
    {
      id: 'participant-1',
      name: 'テスト参加者1',
      weapon: 'シューター',
      xp: 2000,
      createdAt: '2025-04-06T00:00:00.000Z',
      isCaptain: true,
    },
    {
      id: 'participant-2',
      name: 'テスト参加者2',
      weapon: 'チャージャー',
      xp: 2200,
      createdAt: '2025-04-06T00:00:00.000Z',
      isCaptain: false,
    },
  ];

  const mockTournamentId = 'test-tournament-123';
  const mockOnCaptainToggle = jest.fn();
  const mockOnAddParticipant = jest.fn();

  beforeEach(() => {
    // 各テスト前にモック関数をリセット
    mockOnCaptainToggle.mockClear();
    mockOnAddParticipant.mockClear();
  });

  it('参加者一覧が正しく表示されること', () => {
    render(
      <ParticipantList
        tournamentId={mockTournamentId}
        participants={mockParticipants}
        onCaptainToggle={mockOnCaptainToggle}
        onAddParticipant={mockOnAddParticipant}
      />
    );

    // 参加者名が表示されている
    expect(screen.getByText('テスト参加者1')).toBeInTheDocument();
    expect(screen.getByText('テスト参加者2')).toBeInTheDocument();

    // 使用武器が表示されている
    expect(screen.getByText('シューター')).toBeInTheDocument();
    expect(screen.getByText('チャージャー')).toBeInTheDocument();

    // XPが表示されている（toLocaleStringでフォーマットされるため）
    expect(screen.getByText('2,000')).toBeInTheDocument();
    expect(screen.getByText('2,200')).toBeInTheDocument();

    // 主将ボタンとテーブルヘッダーが存在する（thとボタンを区別して取得）
    const tableHeaders = screen.getAllByRole('columnheader');
    const captainColumnHeader = tableHeaders.find((header) => header.textContent === '主将');
    expect(captainColumnHeader).toBeInTheDocument();

    // 主将/主ボタンが存在する
    const captainButtons = screen
      .getAllByRole('button')
      .filter((button) => button.textContent === '主将' || button.textContent === '主');
    expect(captainButtons.length).toBe(2); // 2つのボタンがあるはず
    expect(captainButtons[0].textContent).toBe('主将'); // 1つ目は「主将」
    expect(captainButtons[1].textContent).toBe('主'); // 2つ目は「主」
  });

  it('参加者がいない場合のメッセージが表示されること', () => {
    render(
      <ParticipantList
        tournamentId={mockTournamentId}
        participants={[]}
        onCaptainToggle={mockOnCaptainToggle}
        onAddParticipant={mockOnAddParticipant}
      />
    );

    expect(screen.getByText('参加者はまだいません')).toBeInTheDocument();
  });

  it('主将ボタンをクリックするとonCaptainToggleが呼ばれること', () => {
    render(
      <ParticipantList
        tournamentId={mockTournamentId}
        participants={mockParticipants}
        onCaptainToggle={mockOnCaptainToggle}
        onAddParticipant={mockOnAddParticipant}
      />
    );

    // テスト参加者2の行を見つけて、その中の「主」ボタンをクリック
    const participant2Row = screen
      .getAllByRole('row')
      .find((row) => within(row).queryByText('テスト参加者2') !== null);

    // 参加者2の行が見つからない場合はエラーを投げる
    if (!participant2Row) throw new Error('Participant 2 row not found');

    const captainButton = within(participant2Row).getByRole('button');
    fireEvent.click(captainButton);

    // onCaptainToggleがparticipant-2のIDで呼び出されているか確認
    expect(mockOnCaptainToggle).toHaveBeenCalledWith('participant-2');
  });

  it('参加者追加ボタンをクリックするとonAddParticipantが呼ばれること', () => {
    render(
      <ParticipantList
        tournamentId={mockTournamentId}
        participants={mockParticipants}
        onCaptainToggle={mockOnCaptainToggle}
        onAddParticipant={mockOnAddParticipant}
      />
    );

    const addButton = screen.getByText('参加者を追加');
    fireEvent.click(addButton);

    expect(mockOnAddParticipant).toHaveBeenCalled();
  });

  it('主将の場合にキャプテンページへのリンクが表示されること', () => {
    render(
      <ParticipantList
        tournamentId={mockTournamentId}
        participants={mockParticipants}
        onCaptainToggle={mockOnCaptainToggle}
        onAddParticipant={mockOnAddParticipant}
      />
    );

    const captainPageLink = screen.getByText(/テスト参加者1のキャプテンページを表示/);
    expect(captainPageLink).toBeInTheDocument();

    // リンク先が正しいか確認
    const linkElement = captainPageLink.closest('a')!;
    expect(linkElement).not.toBeNull();
    if (linkElement) {
      expect(linkElement).toHaveAttribute(
        'href',
        `/tournaments/${mockTournamentId}/captain/participant-1`
      );
    }
  });
});
