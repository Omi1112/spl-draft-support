/**
 * トーナメント関連のアプリケーションエラー
 */
export class TournamentApplicationError extends Error {
  /**
   * エラーコード
   */
  readonly code: string;

  /**
   * コンストラクタ
   * @param message エラーメッセージ
   * @param code エラーコード
   */
  constructor(message: string, code: string) {
    super(message);
    this.name = 'TournamentApplicationError';
    this.code = code;
  }
}
