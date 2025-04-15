# LINT-001 NominateParticipantUseCaseのimport順序と未使用import修正（fix）

## 概要

- 対象ファイル: app/api/core/application/useCases/draft/NominateParticipantUseCase.ts
- 内容: import順序の修正と未使用importの削除

## 実施手順

1. import文の順序を修正し、未使用import（DraftId）を削除する。
2. 変更後、lintエラーが解消されていることを確認する。
3. 必要に応じてコメントを日本語で記載する。

## 注意事項

- 他のimport順序ルールも守ること。
- 既存のロジックには影響を与えないこと。
