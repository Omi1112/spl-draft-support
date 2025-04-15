# LINT-002 AddParticipantUseCaseの未使用変数修正 (fix)

## 概要

- `app/api/core/application/useCases/participant/AddParticipantUseCase.ts` の未使用変数 `participantId` を修正する。

## 手順

1. `participantId` が未使用の場合は削除、または変数名を `_participantId` などに変更する。
2. 変更後、ESLintエラーが解消されていることを確認する。
