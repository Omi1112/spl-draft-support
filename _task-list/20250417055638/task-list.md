# タスクリスト

## タスク一覧

- タスクID: FIX-FE-QUERY-001
  - タスク名: FEのQueryからisCaptainフィールドの参照を削除
  - タスク種類: fix
  - タスクの概要: GraphQLスキーマに存在しないisCaptainフィールドをFEのQueryから削除し、エラーを解消する
- タスクID: FIX-FE-QUERY-002
  - タスク名: isCaptain参照をTournamentParticipantに修正
  - タスク種類: fix
  - タスクの概要: isCaptainがTournamentParticipant型に存在するため、FEのQueryやロジックでTournamentParticipant経由で参照するよう修正する
