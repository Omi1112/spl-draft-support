# TP-REF-002 スキーマ設計方針策定（research）

## 概要

GraphQLスキーマを軸に、TournamentParticipant主軸・Participantネスト型の設計方針を明確化し、今後の型・API・UI設計の指針を定める。

## 実施手順

1. TP-REF-001の調査結果をもとに、現状のスキーマ・DTO・型定義の課題を整理。
2. TournamentParticipantを主軸とし、Participantは詳細情報としてネストする設計方針を明文化。
3. 設計方針に基づき、型・API・UI・テストの修正方針をまとめる。
4. 設計方針・修正方針をドキュメント化し、次タスク（型・エンティティ整理）に繋げる。

## 注意点

- 既存のAPI/UI/テストの影響範囲を明確にすること。
- 設計方針は今後のリファクタリングの基準となるため、曖昧さを残さないこと。
- 変更点・移行方針は必ず明文化すること。

---

参照: .github/copilot-instructions.md
