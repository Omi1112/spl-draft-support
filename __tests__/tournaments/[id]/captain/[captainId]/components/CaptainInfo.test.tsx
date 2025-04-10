import React from 'react';
import { render, screen } from '@testing-library/react';
import { CaptainInfo } from '../../../../../../app/tournaments/[id]/captain/[captainId]/components/CaptainInfo';
import { Participant } from '../../../../../../app/tournaments/[id]/captain/[captainId]/types';

describe('CaptainInfo', () => {
  const mockCaptain: Participant = {
    id: 'captain-1',
    name: 'テストキャプテン',
    weapon: 'シューター',
    xp: 2500,
    createdAt: '2025-04-06T00:00:00.000Z',
  };

  it('キャプテン情報が正しく表示されること', () => {
    render(<CaptainInfo captain={mockCaptain} />);

    // キャプテン名が表示されていることを確認
    expect(screen.getByText('テストキャプテン')).toBeInTheDocument();

    // キャプテンラベルが表示されていることを確認
    expect(screen.getByText('キャプテン')).toBeInTheDocument();

    // ヘッダーが表示されていることを確認
    expect(screen.getByText('キャプテン情報')).toBeInTheDocument();

    // アバター（頭文字）が表示されていることを確認
    expect(screen.getByText('テ')).toBeInTheDocument();
  });

  it('コンポーネントのスタイルが適切に設定されていること', () => {
    const { container } = render(<CaptainInfo captain={mockCaptain} />);

    // メインコンテナにスタイルクラスが適用されていることを確認
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-white');
    expect(mainDiv).toHaveClass('rounded-lg');
    expect(mainDiv).toHaveClass('shadow-sm');

    // アバター要素のスタイルが適切に設定されていることを確認
    const avatar = screen.getByText('テ');
    expect(avatar).toHaveClass('bg-red-500');
    expect(avatar).toHaveClass('rounded-full');
    expect(avatar).toHaveClass('text-white');

    // キャプテン情報のヘッダータグを確認
    const header = screen.getByText('キャプテン情報');
    expect(header.tagName).toBe('H2');
    expect(header).toHaveClass('text-xl');
    expect(header).toHaveClass('font-semibold');
  });

  it('長い名前のキャプテンでも頭文字だけが正しく表示されること', () => {
    const longNameCaptain: Participant = {
      ...mockCaptain,
      name: 'アイウエオカキクケコ',
    };

    render(<CaptainInfo captain={longNameCaptain} />);

    // 頭文字「ア」だけが表示されていることを確認
    expect(screen.getByText('ア')).toBeInTheDocument();
  });
});
