// TournamentNameのValueObject実装
export class TournamentName {
  private readonly _value: string;

  // 最小・最大文字数の定数定義
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 100;

  // 禁止文字パターン（特殊記号の組み合わせ）
  private static readonly FORBIDDEN_CHARS_PATTERN = /[<>{}[\]\\|^`]/;

  private constructor(value: string) {
    // 入力値の先頭・末尾の空白を削除
    const trimmedValue = value.trim();

    // 必須チェック
    if (!trimmedValue) {
      throw new Error('大会名は必須です');
    }

    // 最小長チェック
    if (trimmedValue.length < TournamentName.MIN_LENGTH) {
      throw new Error(`大会名は${TournamentName.MIN_LENGTH}文字以上で入力してください`);
    }

    // 最大長チェック
    if (trimmedValue.length > TournamentName.MAX_LENGTH) {
      throw new Error(`大会名は${TournamentName.MAX_LENGTH}文字以内で入力してください`);
    }

    // 禁止文字チェック
    if (TournamentName.FORBIDDEN_CHARS_PATTERN.test(trimmedValue)) {
      throw new Error(
        '大会名に使用できない文字が含まれています (<, >, {, }, [, ], \\, |, ^, ` など)'
      );
    }

    this._value = trimmedValue;
  }

  /**
   * 新しいTournamentNameを作成
   * @param value 大会名
   * @returns TournamentName
   */
  static create(value: string): TournamentName {
    return new TournamentName(value);
  }

  /**
   * 既存の大会名から復元
   * @param value 大会名
   * @returns TournamentName
   */
  static reconstruct(value: string): TournamentName {
    return new TournamentName(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other?: TournamentName | null): boolean {
    if (!other) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
