# タスク: `GetTournamentUseCase.ts` の TS2322 エラーを修正する

## 概要

`app/api/core/application/useCases/tournament/GetTournamentUseCase.ts` ファイルで発生している TypeScript の型エラー (TS2322) を修正します。
エラー内容は `Type '{ ... }[]' is not assignable to type 'TournamentParticipantDTO[]'. Property 'id' is missing in type '{ ... }' but required in type 'TournamentParticipantDTO'.` です。

## 手順

1.  **エラー箇所の特定:**

    - `app/api/core/application/useCases/tournament/GetTournamentUseCase.ts` の 31 行目を確認します。
    - `participants.map(...)` の結果を `tournamentParticipants` 変数に代入しようとしていますが、`map` 内で生成されるオブジェクトの型が期待される `TournamentParticipantDTO` 型と一致していません。具体的には、`id` プロパティが不足しています。

2.  **原因調査:**

    - `TournamentParticipantDTO` 型の定義 (`app/api/core/application/interfaces/DTOs.ts` 内にある可能性が高い) を確認し、必須プロパティを確認します。特に `id` が必須であることを確認します。
    - `map` 関数内で生成されているオブジェクトの構造を確認し、`id` プロパティが含まれていないことを確認します。
    - `participants` 配列の要素 (`p`) の型を確認し、`TournamentParticipantDTO` に必要な `id` をどこから取得できるかを確認します。おそらく `p.id` や `p.participant.id` などから取得できるはずです。

3.  **修正:**

    - `map` 関数内で生成するオブジェクトに、`TournamentParticipantDTO` で必須とされている `id` プロパティを追加します。
    - `p` オブジェクトから適切な値を取得して `id` に設定します。例: `id: p.id` や `id: p.participant.id` など。

    ```typescript
    // 修正例
    tournamentParticipants: participants.map((p) => ({
      id: p.id, // または p.participant.id など、正しいIDのソースを指定
      tournament: { /* ... */ },
      participant: { /* ... */ },
      isCaptain: p.isCaptain,
      createdAt: p.createdAt.toISOString(),
      // 他に必要なプロパティがあれば追加
    })),
    ```

4.  **確認:**
    - `npm run typecheck` を実行し、エラーが解消されたことを確認します。
    - 関連する機能が正しく動作することを確認します (必要であればテストを追加・実行します)。
