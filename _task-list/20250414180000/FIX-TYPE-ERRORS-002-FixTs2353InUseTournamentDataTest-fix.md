# タスク: `useTournamentData.test.ts` の TS2353 エラーを修正する

## 概要

`__tests__/tournaments/[id]/hooks/useTournamentData.test.ts` ファイルで発生している TypeScript の型エラー (TS2353) を修正します。
エラー内容は `Object literal may only specify known properties, and 'participants' does not exist in type 'Tournament'.` です。

## 手順

1.  **エラー箇所の特定:**

    - `__tests__/tournaments/[id]/hooks/useTournamentData.test.ts` の 253 行目を確認します。
    - `Tournament` 型のオブジェクトリテラルで、存在しない `participants` プロパティが使用されています。

2.  **原因調査:**

    - `Tournament` 型の定義を確認し、`participants` プロパティが含まれていないことを確認します。
    - テストコードの意図を確認し、なぜ `participants` を含めようとしているのかを理解します。
      - モックデータとして不要なプロパティが含まれている可能性があります。
      - `Tournament` 型の定義が古い、または不完全である可能性があります。

3.  **修正:**

    - テストコードの意図に基づき、以下のいずれかの方法で修正します。
      - オブジェクトリテラルから不要な `participants` プロパティを削除します。
      - もし `Tournament` 型に `participants` が必要なのであれば、型定義を修正します（ただし、他の箇所への影響を考慮する必要があります）。

4.  **確認:**
    - `npm run typecheck` を実行し、エラーが解消されたことを確認します。
    - 関連するテスト (`npm test __tests__/tournaments/[id]/hooks/useTournamentData.test.ts`) が成功することを確認します。
