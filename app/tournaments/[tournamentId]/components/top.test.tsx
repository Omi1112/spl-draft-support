import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';
import { TournamentCreateModal } from '@/app/tournaments/components/TournamentCreateModal';
import { TournamentList } from '@/app/tournaments/components/TournamentList';
import { TournamentTopContainer } from '@/app/tournaments/components/TournamentTopContainer';

// TournamentListの単体テスト
// fetchTournamentsをモック
jest.mock('@/app/client/tournament/fetchTournaments', () => ({
  fetchTournaments: jest.fn().mockResolvedValue([
    { id: '1', name: '大会A', createdAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: '大会B', createdAt: '2024-01-02T00:00:00Z' },
  ]),
}));

describe('TournamentList', () => {
  it('トーナメント一覧が表示される', async () => {
    // 読み込み中の表示が一瞬でも出ることをfindByTextで検証
    render(<TournamentList />);
    expect(await screen.findByText('読み込み中...')).toBeInTheDocument();
    // トーナメントデータの取得・描画を待つ
    const items = await screen.findAllByRole('listitem');
    expect(items.some((li) => li.textContent?.includes('大会A'))).toBe(true);
    expect(items.some((li) => li.textContent?.includes('大会B'))).toBe(true);
  });
});

// TournamentCreateModalの単体テスト
jest.mock('@/app/client/tournament/createTournament', () => ({
  createTournament: jest.fn().mockResolvedValue({
    id: '3',
    name: '新規大会',
    createdAt: '2024-01-03T00:00:00Z',
  }),
}));

describe('TournamentCreateModal', () => {
  it('トーナメント名未入力でバリデーションエラー', async () => {
    // isOpen, onCreated, onClose 以外のpropsは渡さない
    render(<TournamentCreateModal isOpen={true} />);
    fireEvent.click(screen.getByText('作成'));
    // findByTextで非同期的にバリデーションエラー表示を検証
    expect(await screen.findByText('トーナメント名は必須です')).toBeInTheDocument();
  });
  it('トーナメント作成成功時にonCreatedが呼ばれる', async () => {
    const onCreated = jest.fn();
    render(<TournamentCreateModal isOpen={true} onCreated={onCreated} />);
    fireEvent.change(screen.getByPlaceholderText('トーナメント名'), {
      target: { value: '新規大会' },
    });
    fireEvent.click(screen.getByText('作成'));
    // waitForでonCreatedが呼ばれるまで待機
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });
});

// TournamentTopContainerの単体テスト（統合テスト的）
describe('TournamentTopContainer', () => {
  it('作成ボタンでモーダルが開く', async () => {
    render(<TournamentTopContainer />);
    fireEvent.click(screen.getByText('トーナメント作成'));
    // h2要素（モーダルの見出し）が非同期で表示されるのをfindByRoleで検証
    expect(
      await screen.findByRole('heading', { name: 'トーナメント作成', level: 2 })
    ).toBeInTheDocument();
  });
});
