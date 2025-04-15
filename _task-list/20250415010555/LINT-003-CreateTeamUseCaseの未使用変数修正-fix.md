# LINT-003 CreateTeamUseCaseの未使用変数修正 (fix)

## 概要

- `app/api/core/application/useCases/team/CreateTeamUseCase.ts` の未使用変数 `teamId` を修正する。

## 手順

1. `teamId` が未使用の場合は削除、または変数名を `_teamId` などに変更する。
2. 変更後、ESLintエラーが解消されていることを確認する。
