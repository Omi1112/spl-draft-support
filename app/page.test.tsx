// filepath: /workspace/__tests__/app/page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';

import Home from '@/app/page';

describe('Home (TOPページ)', () => {
  it('大会一覧が表示される', () => {
    render(<Home />);
    expect(screen.getByText('大会一覧')).toBeInTheDocument();
    expect(screen.getByText('Tournament 1（作成日: 2023年1月1日）')).toBeInTheDocument();
    expect(screen.getByText('Tournament 2（作成日: 2023年1月2日）')).toBeInTheDocument();
  });

  it('大会作成モーダルが開閉できる', () => {
    render(<Home />);
    fireEvent.click(screen.getByText('大会を作成する'));
    expect(screen.getByText('大会作成')).toBeInTheDocument();
    fireEvent.click(screen.getByText('キャンセル'));
    expect(screen.queryByText('大会作成')).not.toBeInTheDocument();
  });

  it('大会を新規作成できる', () => {
    jest.useFakeTimers();
    render(<Home />);
    fireEvent.click(screen.getByText('大会を作成する'));
    const input = screen.getByLabelText('大会名:');
    fireEvent.change(input, { target: { value: '新大会' } });
    fireEvent.click(screen.getByText('作成'));
    jest.advanceTimersByTime(500);
    expect(screen.getByText(/新大会（作成日:/)).toBeInTheDocument();
    jest.useRealTimers();
  });
});
