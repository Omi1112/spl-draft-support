import { renderHook, act } from '@testing-library/react';
import { useParticipantForm } from '../../../../app/tournaments/[id]/hooks/useParticipantForm';
import { addParticipantToTournament } from '../../../../app/client/tournamentClient';
import {
  createEmptyParticipantForm,
  createParticipantData,
} from '../../../../app/tournaments/[id]/hooks/tournamentUtils';

// モックの設定
jest.mock('../../../../app/client/tournamentClient', () => ({
  addParticipantToTournament: jest.fn(),
}));

jest.mock('../../../../app/tournaments/[id]/hooks/tournamentUtils', () => ({
  createEmptyParticipantForm: jest.fn().mockReturnValue({ name: '', weapon: '', xp: '' }),
  createParticipantData: jest.fn((data) => ({
    name: data.name,
    weapon: data.weapon,
    xp: parseInt(data.xp) || 0,
  })),
}));

describe('useParticipantForm', () => {
  const mockTournament = {
    id: '1',
    name: 'テストトーナメント',
    createdAt: '2025-04-07T00:00:00.000Z',
    tournamentParticipants: [],
  };
  const mockOnParticipantAdded = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態が正しく設定されること', () => {
    const { result } = renderHook(() => useParticipantForm(mockTournament, mockOnParticipantAdded));

    expect(result.current.showModal).toBe(false);
    expect(result.current.participantForm).toEqual({
      name: '',
      weapon: '',
      xp: '',
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBeNull();
  });

  it('setShowModalでモーダル表示状態を変更できること', () => {
    const { result } = renderHook(() => useParticipantForm(mockTournament, mockOnParticipantAdded));

    act(() => {
      result.current.setShowModal(true);
    });

    expect(result.current.showModal).toBe(true);

    act(() => {
      result.current.setShowModal(false);
    });

    expect(result.current.showModal).toBe(false);
  });

  it('handleChangeで入力値を正しく更新できること', () => {
    const { result } = renderHook(() => useParticipantForm(mockTournament, mockOnParticipantAdded));

    const mockEvent = {
      target: { name: 'name', value: 'テスト名前' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(result.current.participantForm.name).toBe('テスト名前');

    // 武器の変更テスト
    const weaponEvent = {
      target: { name: 'weapon', value: 'シューター' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(weaponEvent);
    });

    expect(result.current.participantForm.weapon).toBe('シューター');

    // XPの変更テスト
    const xpEvent = {
      target: { name: 'xp', value: '2000' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(xpEvent);
    });

    expect(result.current.participantForm.xp).toBe('2000');
  });

  it('handleSubmitが正常に動作し、成功時にモーダルが閉じられること', async () => {
    // API呼び出しが成功するようにモック
    (addParticipantToTournament as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useParticipantForm(mockTournament, mockOnParticipantAdded));

    // 初期状態の確認
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showModal).toBe(false);

    // モーダルを開く
    act(() => {
      result.current.setShowModal(true);
    });

    expect(result.current.showModal).toBe(true);

    // フォーム入力
    const nameEvent = {
      target: { name: 'name', value: '山田太郎' },
    } as React.ChangeEvent<HTMLInputElement>;

    const weaponEvent = {
      target: { name: 'weapon', value: 'シューター' },
    } as React.ChangeEvent<HTMLInputElement>;

    const xpEvent = {
      target: { name: 'xp', value: '2000' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(nameEvent);
      result.current.handleChange(weaponEvent);
      result.current.handleChange(xpEvent);
    });

    // フォーム送信
    const preventDefault = jest.fn();
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    // 検証
    expect(preventDefault).toHaveBeenCalled();
    expect(createParticipantData).toHaveBeenCalledWith({
      name: '山田太郎',
      weapon: 'シューター',
      xp: '2000',
    });
    expect(addParticipantToTournament).toHaveBeenCalledWith('1', {
      name: '山田太郎',
      weapon: 'シューター',
      xp: 2000,
    });
    expect(mockOnParticipantAdded).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showModal).toBe(false);
    expect(result.current.participantForm).toEqual({
      name: '',
      weapon: '',
      xp: '',
    });
  });

  it('送信中はisSubmittingがtrueになること', async () => {
    // 意図的に遅延するモックを設定
    (addParticipantToTournament as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    );

    const { result } = renderHook(() => useParticipantForm(mockTournament, mockOnParticipantAdded));

    // フォーム送信開始
    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    // 送信中状態の検証
    expect(result.current.isSubmitting).toBe(true);

    // 処理完了を待機
    await act(async () => {
      await submitPromise;
    });

    // 送信完了後の状態検証
    expect(result.current.isSubmitting).toBe(false);
  });

  it('エラー発生時にエラー状態が設定されること', async () => {
    // エラーを投げるモック
    const testError = new Error('API Error');
    (addParticipantToTournament as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => useParticipantForm(mockTournament, mockOnParticipantAdded));

    // フォーム送信
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    // エラー状態の検証
    expect(result.current.submitError).toBe('参加者の追加に失敗しました。');
    expect(result.current.isSubmitting).toBe(false);
    // モーダルは閉じられていないこと
    expect(result.current.showModal).toBe(false);
  });

  it('tournamentがnullの場合は処理が実行されないこと', async () => {
    const { result } = renderHook(() => useParticipantForm(null, mockOnParticipantAdded));

    // フォーム送信
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    // APIが呼ばれていないことを検証
    expect(addParticipantToTournament).not.toHaveBeenCalled();
    expect(mockOnParticipantAdded).not.toHaveBeenCalled();
  });
});
