import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddParticipantModal } from '../../../app/components/tournaments/AddParticipantModal';
import { ParticipantFormData } from '../../../app/components/tournaments/types';

describe('AddParticipantModal', () => {
  const mockFormData: ParticipantFormData = {
    name: 'テストプレイヤー',
    weapon: 'スプラッシュ',
    xp: '2000',
  };

  const mockProps = {
    isOpen: true,
    isSubmitting: false,
    error: null,
    formData: mockFormData,
    onClose: jest.fn(),
    onChange: jest.fn(),
    onSubmit: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('モーダルが開いている場合に表示されること', () => {
    render(<AddParticipantModal {...mockProps} />);

    expect(screen.getByText('参加者を追加')).toBeInTheDocument();
    expect(screen.getByLabelText(/名前/)).toBeInTheDocument();
    expect(screen.getByLabelText(/使用武器/)).toBeInTheDocument();
    expect(screen.getByLabelText(/XP/)).toBeInTheDocument();
  });

  it('モーダルが閉じている場合に表示されないこと', () => {
    render(<AddParticipantModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText('参加者を追加')).not.toBeInTheDocument();
  });

  it('フォームの入力値が正しく表示されること', () => {
    render(<AddParticipantModal {...mockProps} />);

    const nameInput = screen.getByLabelText(/名前/) as HTMLInputElement;
    const weaponInput = screen.getByLabelText(/使用武器/) as HTMLInputElement;
    const xpInput = screen.getByLabelText(/XP/) as HTMLInputElement;

    expect(nameInput.value).toBe('テストプレイヤー');
    expect(weaponInput.value).toBe('スプラッシュ');
    expect(xpInput.value).toBe('2000');
  });

  it('入力フィールドを変更するとonChangeが呼ばれること', () => {
    render(<AddParticipantModal {...mockProps} />);

    const nameInput = screen.getByLabelText(/名前/);
    fireEvent.change(nameInput, { target: { value: '新しい名前' } });

    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it('エラーメッセージが表示されること', () => {
    const errorMessage = '名前は必須です';
    render(<AddParticipantModal {...mockProps} error={errorMessage} />);

    // エラーメッセージが表示されていることを確認
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();

    // エラーメッセージの親要素がエラースタイリングを持っていることを確認
    const errorContainer = errorElement.closest('div');
    expect(errorContainer).toHaveClass('bg-red-50');
    expect(errorContainer).toHaveClass('border-red-200');
  });

  it('送信中の場合、ボタンが無効化されて正しいテキストが表示されること', () => {
    render(<AddParticipantModal {...mockProps} isSubmitting={true} />);

    const submitButton = screen.getByText('送信中...');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('opacity-70');
  });

  it('フォーム送信時にonSubmitが呼ばれること', () => {
    render(<AddParticipantModal {...mockProps} />);

    const form = document.querySelector('form');
    if (!form) throw new Error('Form element not found');
    fireEvent.submit(form);

    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれること', () => {
    render(<AddParticipantModal {...mockProps} />);

    const closeButton = screen.getByText('キャンセル');
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('XアイコンボタンをクリックするとonCloseが呼ばれること', () => {
    render(<AddParticipantModal {...mockProps} />);

    // SVGを含むボタン
    const closeIconButton = document.querySelector('button[class*="text-gray-500"]');
    if (!closeIconButton) throw new Error('Close icon button not found');
    fireEvent.click(closeIconButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });
});
