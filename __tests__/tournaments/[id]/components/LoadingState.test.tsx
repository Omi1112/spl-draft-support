import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../../../../app/tournaments/[id]/components/LoadingState';

describe('LoadingState', () => {
  it('読み込み中メッセージが表示されること', () => {
    render(<LoadingState />);

    expect(screen.getByText('ロード中...')).toBeInTheDocument();
  });

  it('適切なスタイルクラスが適用されていること', () => {
    const { container } = render(<LoadingState />);

    // コンテナのクラス確認
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('max-w-4xl');
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('items-center');
    expect(mainDiv).toHaveClass('justify-center');

    // スピナーのrole確認
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
