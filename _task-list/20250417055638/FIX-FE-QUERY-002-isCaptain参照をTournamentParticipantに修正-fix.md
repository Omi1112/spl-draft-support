# タスク詳細: FIX-FE-QUERY-002

## タスク名

isCaptain参照をTournamentParticipantに修正

## タスク種類

fix

## タスクの概要

isCaptainがTournamentParticipant型に存在するため、FEのQueryやロジックでTournamentParticipant経由で参照するよう修正する。

## 実行手順

1. フロントエンドでisCaptainを参照している箇所を検索し、Participant型から直接参照している部分を特定する。
2. それらの箇所をTournamentParticipant型経由でisCaptainを参照するようにQueryやロジックを修正する。
3. 必要に応じて型定義や関連ロジックも修正する。
4. `npm run lint`、`npm run typecheck`、`npm run test`、`npm run build`、`npm run test:e2e` を順に実行し、エラーがないことを確認する。
5. エラーが出た場合は修正タスクを追加し、即時対応する。
