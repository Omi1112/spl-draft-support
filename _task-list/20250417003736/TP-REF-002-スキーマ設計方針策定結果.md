# TP-REF-002 スキーマ設計方針策定 結果

## 設計方針

- GraphQL/API/DTO/型定義/テスト/UIの全てで「TournamentParticipant主軸・Participantネスト型」へ統一する。
- `TournamentParticipant`は「大会と参加者の関連・状態（isCaptain, teamId, createdAt等）」を担い、`Participant`は「個人情報（name, weapon, xp等）」のみを持つ。
- 返却値・DTO・UI表示も「TournamentParticipant + Participant詳細情報」の複合型を標準とする。
- `Tournament`型の`participants`フィールドは廃止・非推奨とし、`tournamentParticipants`のみを利用する。
- 既存のAPI/UI/テストもこの方針に合わせて段階的に修正する。

## 修正方針

- 型定義・DTO・エンティティの責務を明確化し、重複・曖昧な箇所を排除。
- サービス/ユースケース層・API/Resolver層・UI/テスト層の全てでTournamentParticipant主軸に統一。
- 既存のParticipant単体利用箇所はTournamentParticipant経由にリファクタリング。
- 影響範囲の大きい箇所は段階的に修正し、テストで担保。

## 次タスク

TP-REF-003 型・エンティティ整理

---

参照: .github/copilot-instructions.md
