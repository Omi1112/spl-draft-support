import { formatDate } from '../../app/utils/formatDate';

describe('formatDate', () => {
  // 実際のDate.toLocaleDateStringの挙動を保存
  const originalToLocaleDateString = Date.prototype.toLocaleDateString;

  beforeEach(() => {
    // テスト用にDate.toLocaleDateStringをモック
    Date.prototype.toLocaleDateString = function (
      locale?: string | string[],
      options?: Intl.DateTimeFormatOptions
    ) {
      // 日本語ロケールと正しいオプションが使われていることを確認
      expect(locale).toBe('ja-JP');
      expect(options).toEqual({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // テスト用の日付文字列を返す
      const year = this.getFullYear();
      const month = this.getMonth() + 1;
      const day = this.getDate();
      return `${year}年${month}月${day}日`;
    };
  });

  afterEach(() => {
    // オリジナルのメソッドを復元
    Date.prototype.toLocaleDateString = originalToLocaleDateString;
  });

  it('ISO形式の日付文字列を日本語形式にフォーマットすること', () => {
    // 固定の日付を使用
    const result = formatDate('2025-04-07T12:34:56.789Z');
    expect(result).toBe('2025年4月7日');
  });

  it('異なる日付でも正しくフォーマットされること', () => {
    expect(formatDate('2024-01-15T00:00:00.000Z')).toBe('2024年1月15日');
    expect(formatDate('2023-12-31T23:59:59.999Z')).toBe('2023年12月31日');
  });

  it('無効な日付文字列の場合はInvalid Dateとなること', () => {
    // モックを一時的に解除して実際の挙動をテスト
    Date.prototype.toLocaleDateString = originalToLocaleDateString;

    const invalidDate = formatDate('invalid-date');

    // ブラウザによって表示が異なる可能性があるため、大まかな比較のみ
    expect(invalidDate).toEqual(
      expect.stringContaining('Invalid Date') || expect.stringContaining('NaN')
    );
  });
});
