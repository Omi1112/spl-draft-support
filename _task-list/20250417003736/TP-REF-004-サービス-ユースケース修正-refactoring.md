# TP-REF-004 サービス/ユースケース修正（refactoring）

## 概要

TP-REF-003で整理した型・エンティティに基づき、サービス・ユースケース層のTournamentParticipant/Participant利用箇所を修正し、TournamentParticipant主軸の設計へ統一する。

## 実施手順

1. 既存のサービス・ユースケース層でParticipantを直接扱っている箇所を洗い出す。
2. TournamentParticipant主軸・Participantネスト型の設計方針に従い、DTO・返却値・引数等を修正。
3. 既存のロジック・テストが壊れないように段階的にリファクタリング。
4. 変更点・注意点をコメント・ドキュメントに反映。

## 注意点

- 既存のAPI/テストへの影響範囲を十分に確認すること。
- 型安全性・一貫性を最優先とする。
- 変更点は必ずコメント・ドキュメントに反映する。

---

参照: .github/copilot-instructions.md
