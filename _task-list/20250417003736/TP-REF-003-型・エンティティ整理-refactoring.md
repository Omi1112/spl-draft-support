# TP-REF-003 型・エンティティ整理（refactoring）

## 概要

TP-REF-002で策定した設計方針に基づき、Prisma/TypeScript型・エンティティを整理し、TournamentParticipant主軸・Participantネスト型へ統一する。

## 実施手順

1. Prismaスキーマ・TypeScript型定義・DTOを調査し、TournamentParticipant/Participantの責務・構造を整理。
2. TournamentParticipant主軸・Participantネスト型へ型定義・DTOを修正。
3. 既存の型・DTO・エンティティの不要な部分や重複を削除。
4. 型安全性・一貫性を担保するためのテスト・型チェックを実施。

## 注意点

- any型やunknown型は一切使用しない。
- 既存のAPI/ユースケース/テストへの影響範囲を把握し、必要に応じて型修正を段階的に行う。
- 変更点は必ずコメント・ドキュメントに反映する。

---

参照: .github/copilot-instructions.md
