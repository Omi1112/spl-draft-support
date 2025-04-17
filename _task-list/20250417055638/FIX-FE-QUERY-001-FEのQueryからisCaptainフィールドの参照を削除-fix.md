# タスク詳細: FIX-FE-QUERY-001

## タスク名

FEのQueryからisCaptainフィールドの参照を削除

## タスク種類

fix

## タスクの概要

GraphQLスキーマに存在しないisCaptainフィールドをFEのQueryから削除し、エラーを解消する。

## 実行手順

1. フロントエンドでGraphQLのParticipant型を参照しているQueryを検索し、isCaptainフィールドを参照している箇所を特定する。
2. すべての該当QueryからisCaptainフィールドの参照を削除する。
3. 型定義や関連ロジックも必要に応じて修正する。
4. `npm run lint`、`npm run typecheck`、`npm run test`、`npm run build`、`npm run test:e2e` を順に実行し、エラーがないことを確認する。
5. エラーが出た場合は修正タスクを追加し、即時対応する。
