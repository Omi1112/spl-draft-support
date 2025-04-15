# LINT-001 NominateParticipantUseCaseのimport順序・未使用import修正 (fix)

## 概要

- `app/api/core/application/useCases/draft/NominateParticipantUseCase.ts` のimport順序を修正し、未使用importを削除する。

## 手順

1. import文の順序をESLintルールに従い修正する。
2. 未使用の `DraftId` import を削除する。
3. 他の未使用importがあれば削除する。
4. 変更後、ESLintエラーが解消されていることを確認する。
