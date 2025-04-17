# TP-REF-005 API/Resolver修正（refactoring）

## 概要

TP-REF-004までの修正内容を反映し、GraphQLリゾルバ/API層のTournamentParticipant/Participant利用箇所をTournamentParticipant主軸・Participantネスト型へ統一する。

## 実施手順

1. GraphQLリゾルバ/API層でParticipantを直接返却・利用している箇所を洗い出す。
2. TournamentParticipant主軸・Participantネスト型の設計方針に従い、返却値・引数・型定義を修正。
3. 既存のクエリ・ミューテーション・テストが壊れないように段階的にリファクタリング。
4. 変更点・注意点をコメント・ドキュメントに反映。

## 注意点

- 既存のUI/テストへの影響範囲を十分に確認すること。
- 型安全性・一貫性を最優先とする。
- 変更点は必ずコメント・ドキュメントに反映する。

---

参照: .github/copilot-instructions.md
