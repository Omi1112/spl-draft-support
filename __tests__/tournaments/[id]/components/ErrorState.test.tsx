import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorState } from '../../../../app/tournaments/[id]/components/ErrorState';

describe('ErrorState', () => {
  it('エラーメッセージが表示されること', () => {
    render(<ErrorState message="エラーが発生しました" />);

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('エラー')).toBeInTheDocument();
  });

  it('カスタムエラーメッセージが表示されること', () => {
    const customErrorMessage = 'データの読み込みに失敗しました';
    render(<ErrorState message={customErrorMessage} />);

    expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
  });

  it('適切なスタイルクラスが適用されていること', () => {
    const { container } = render(<ErrorState message="テストエラー" />);

    // 外側のコンテナ
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('max-w-4xl');

    // エラーメッセージコンテナ（2番目の子要素）
    const errorContainer = outerDiv.firstChild as HTMLElement;
    expect(errorContainer).toHaveClass('bg-red-50');
    expect(errorContainer).toHaveClass('border');
    expect(errorContainer).toHaveClass('border-red-200');
    expect(errorContainer).toHaveClass('rounded-lg');

    // 「トップページに戻る」リンクが存在すること
    expect(screen.getByText('トップページに戻る')).toBeInTheDocument();
  });
});
