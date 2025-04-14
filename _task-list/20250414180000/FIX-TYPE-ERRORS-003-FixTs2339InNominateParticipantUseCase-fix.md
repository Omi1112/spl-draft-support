# タスク: `NominateParticipantUseCase.ts` の TS2339 エラーを修正する

## 概要

`app/api/core/application/useCases/draft/NominateParticipantUseCase.ts` ファイルで発生している TypeScript の型エラー (TS2339) を修正します。
エラー内容は `Property 'findByTournamentIdCaptainIdAndParticipantId' does not exist on type 'DraftRepository'.` です。

## 手順

1.  **エラー箇所の特定:**

    - `app/api/core/application/useCases/draft/NominateParticipantUseCase.ts` の 44 行目を確認します。
    - `draftRepository` オブジェクトに対して、存在しない `findByTournamentIdCaptainIdAndParticipantId` メソッドを呼び出そうとしています。

2.  **原因調査:**

    - `DraftRepository` インターフェースまたはクラスの定義を確認し、`findByTournamentIdCaptainIdAndParticipantId` メソッドが存在しないことを確認します。
    - `NominateParticipantUseCase` のロジックを確認し、どのような意図でこのメソッドを呼び出そうとしているのかを理解します。
      - メソッド名がタイポしている可能性があります。
      - 必要なメソッドが `DraftRepository` に実装されていない可能性があります。
      - 別のリポジトリやメソッドを使用すべき可能性があります。

3.  **修正:**

    - 原因調査の結果に基づき、以下のいずれかの方法で修正します。
      - 正しいメソッド名に修正します (例: 既存の `findByTournamentAndCaptain` や `findByCaptainId` など、意図に合うメソッドを探す)。
      - `DraftRepository` インターフェースとその実装に必要なメソッド (`findByTournamentIdCaptainIdAndParticipantId` または類似の機能を持つメソッド) を追加します。
      - ロジックを見直し、別の方法で目的を達成するようにコードを変更します。

4.  **確認:**
    - `npm run typecheck` を実行し、エラーが解消されたことを確認します。
    - 関連する機能が正しく動作することを確認します (必要であればテストを追加・実行します)。
