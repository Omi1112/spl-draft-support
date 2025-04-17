# TP-REF-001 スキーマ現状調査 結果

## 1. スキーマ定義の要点

- `Participant` は個人のプレイヤー情報（id, name, weapon, xp, createdAt, team など）を持つ。
- `TournamentParticipant` は「大会と参加者の関連」を表し、tournamentId, participantId, isCaptain, teamId, createdAt などを持つ。
- GraphQLスキーマ上、`Tournament` には `tournamentParticipants: [TournamentParticipant!]` と `participants: [Participant!]` の両方が存在するが、実装上は `tournamentParticipants` を主軸にしている。

## 2. サービス/ユースケース層の利用状況

- 参加者追加・取得・キャプテン切替などのユースケースは、
  - 参加者情報の永続化・取得には `Participant` を、
  - 大会への紐付けやキャプテン管理には `TournamentParticipant` を利用。
- 例: AddParticipantToTournamentUseCase では、`Participant` を作成→保存し、`TournamentParticipant` を作成→保存する流れ。

## 3. API/Resolver層の利用状況

- GraphQLリゾルバでは、
  - 参加者追加/取得APIは `TournamentParticipant` を返却しつつ、`Participant` の詳細情報も含めて返す形が多い。
  - テストやUIも `tournamentParticipants` を主軸にデータを流している。

## 4. テスト・UI層の利用状況

- UI（ParticipantList等）は `TournamentParticipant` + `Participant` の複合型（TournamentParticipantWithParticipant等）で受け取る実装。
- テストも同様に `tournamentParticipants` を主軸にしている。

## 5. 問題点・改善ポイント

- `Participant` 単体での操作はほぼなく、常に `TournamentParticipant` 経由で利用されるケースが多い。
- スキーマ・DTO・型定義・UI・テストで「どちらを主軸にするか」が一部曖昧な箇所が残っている。
- `TournamentParticipant` を主軸に一貫させ、`Participant` は詳細情報としてネストする形が望ましい。

---

次タスク: TP-REF-002 スキーマ設計方針策定

---

参照: .github/copilot-instructions.md
