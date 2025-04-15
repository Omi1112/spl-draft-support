# LINT-004 Tournamentエンティティの未使用引数・any型修正（fix）

## 概要

- 対象ファイル: app/api/core/domain/entities/Tournament.ts
- 内容: 未使用引数participantの削除または利用、any型の修正

## 実施手順

1. 未使用引数participantを削除または利用する形に修正する。
2. any型を適切な型に修正する。
3. 変更後、lintエラーが解消されていることを確認する。
4. 必要に応じてコメントを日本語で記載する。

## 注意事項

- 型安全性を重視すること。
- 既存のロジックには影響を与えないこと。
