/**
 * テストのベストプラクティスを示すヘルパーファイル
 * テスト間の依存関係を減らし、各テストが独立して実行できるようにするためのパターンを提供します。
 */

/**
 * テストコンテキスト型定義の例
 * 各テストケースで必要なオブジェクトや状態を定義します
 */
export interface TestContext<T> {
  sut: T; // System Under Test (テスト対象)
  dependencies: Record<string, any>; // 依存オブジェクト
  // その他必要な状態変数
}

/**
 * テスト前に実行する初期化関数の例
 * 各テストケースごとに新しいコンテキストを作成し、状態の共有を防ぎます
 */
export function createTestContext<T>(factoryFn: () => TestContext<T>): () => TestContext<T> {
  return () => {
    // 毎回新しいコンテキストを作成して返す
    return factoryFn();
  };
}

/**
 * モックのクリーンアップを自動化するヘルパー
 * afterEach内で呼び出すことで、テスト間のモックの分離を確保します
 */
export function cleanupMocks(mocks: jest.SpyInstance[]): void {
  mocks.forEach((mock) => {
    mock.mockRestore();
  });
}

/**
 * テスト間の独立性を保証するためのテンプレート例
 *
 * ```typescript
 * describe('EntityName', () => {
 *   // 各テストケース用のコンテキスト作成関数
 *   const createContext = createTestContext<EntityType>(() => {
 *     // 毎回新しいインスタンスを作成
 *     const entity = new EntityType(...);
 *     return {
 *       sut: entity,
 *       dependencies: {},
 *     };
 *   });
 *
 *   // 使用例
 *   describe('methodName', () => {
 *     it('should do something', () => {
 *       // 各テストケースで新しいコンテキストを取得
 *       const { sut } = createContext();
 *
 *       // テスト実行
 *       const result = sut.methodName();
 *
 *       // アサーション
 *       expect(result).toBe(...);
 *     });
 *   });
 * });
 * ```
 */

/**
 * エラー検証用のヘルパー関数
 * 特定のエラーメッセージを正確に検証するために使用します
 */
export function expectErrorWithMessage(action: () => any, expectedMessage: string): void {
  let error: Error | null = null;

  try {
    action();
  } catch (e) {
    error = e as Error;
  }

  expect(error).not.toBeNull();
  expect(error?.message).toBe(expectedMessage);
}

/**
 * 境界条件のテスト用ヘルパー
 * パラメータの境界値のテストを簡単にするためのヘルパー
 */
export function testBoundaryValues<T, R>(
  testFn: (value: T) => R,
  validValues: T[],
  invalidValues: T[],
  errorPredicate?: (error: any) => boolean
): void {
  // 有効な値のテスト
  validValues.forEach((value) => {
    expect(() => testFn(value)).not.toThrow();
  });

  // 無効な値のテスト
  invalidValues.forEach((value) => {
    if (errorPredicate) {
      try {
        testFn(value);
        fail('例外が発生すべきでした');
      } catch (error) {
        expect(errorPredicate(error)).toBe(true);
      }
    } else {
      expect(() => testFn(value)).toThrow();
    }
  });
}
