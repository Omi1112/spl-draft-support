// __tests__/components/tournaments/CreateTournamentModal.test.tsx
// 大会作成モーダルコンポーネントのユニットテスト
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as createModule from '@/client/tournament/createTournament';
import CreateTournamentModal from '@/components/tournaments/CreateTournamentModal';

jest.mock('@/client/tournament/createTournament');

describe('CreateTournamentModal', () => {
  const onClose = jest.fn();
  const onCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('モーダルが開いているときにフォームが表示される', () => {
    render(<CreateTournamentModal open={true} onClose={onClose} onCreated={onCreated} />);
    expect(screen.getByPlaceholderText('大会名を入力')).toBeInTheDocument();
  });

  it('大会名が未入力の場合バリデーションエラーを表示', async () => {
    render(<CreateTournamentModal open={true} onClose={onClose} onCreated={onCreated} />);
    fireEvent.click(screen.getByText('作成'));
    await waitFor(() => {
      expect(screen.getByText('大会名は必須です')).toBeInTheDocument();
    });
  });

  it('正常に大会作成できたらonCreatedとonCloseが呼ばれる', async () => {
    (createModule.createTournament as jest.Mock).mockResolvedValue({ id: '1', name: '大会A' });
    render(<CreateTournamentModal open={true} onClose={onClose} onCreated={onCreated} />);
    fireEvent.change(screen.getByPlaceholderText('大会名を入力'), { target: { value: '大会A' } });
    fireEvent.click(screen.getByText('作成'));
    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('APIエラー時にエラーメッセージを表示', async () => {
    (createModule.createTournament as jest.Mock).mockRejectedValue(new Error('作成失敗'));
    render(<CreateTournamentModal open={true} onClose={onClose} onCreated={onCreated} />);
    fireEvent.change(screen.getByPlaceholderText('大会名を入力'), { target: { value: '大会B' } });
    fireEvent.click(screen.getByText('作成'));
    await waitFor(() => {
      expect(screen.getByText('作成失敗')).toBeInTheDocument();
    });
  });
});
