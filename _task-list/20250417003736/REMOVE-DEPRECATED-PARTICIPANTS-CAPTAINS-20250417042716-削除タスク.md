# participants/captainsフィールド削除タスク

## タスクID: REMOVE-DEPRECATED-PARTICIPANTS-CAPTAINS-20250417042716

### 概要

Tournament型のparticipants/captainsフィールド（deprecated）をGraphQLスキーマから完全に削除し、関連する実装・API・テストもすべて修正・整理する。

### 対象ファイル

- app/api/graphql/types/index.ts
- app/api/graphql/resolvers/participantResolvers.ts
- app/api/core/application/useCases/tournament/GetTournamentUseCase.ts
- app/api/core/application/interfaces/DTOs.ts
- テスト・UIでparticipants/captainsを参照している箇所

### 実施手順

1. GraphQLスキーマ（typeDefs）からparticipants/captainsフィールドを削除。
2. これらフィールドを参照している全てのリゾルバ・ユースケース・DTO・テスト・UIを修正。
3. tournamentParticipants主軸の設計に統一。
4. テスト・型チェックが通ることを確認。

### 注意点

- deprecatedではなく完全削除。
- 互換性維持のための残置コードも全て削除。
- tournamentParticipants主軸で一貫した設計・実装にする。
- 削除に伴う影響範囲を必ず全て修正。

---

参照: .github/copilot-instructions.md
