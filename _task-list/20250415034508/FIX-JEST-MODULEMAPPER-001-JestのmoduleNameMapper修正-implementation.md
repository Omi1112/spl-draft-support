# タスク詳細: JestのmoduleNameMapper修正

## タスクID

FIX-JEST-MODULEMAPPER-001

## タスク名

JestのmoduleNameMapper修正

## タスク種類

implementation

## 概要

JestのmoduleNameMapper設定を修正し、@/app/api/core/domain/entities/配下のimportエラーを解消する。

## 実施手順

1. jest.config.jsのmoduleNameMapper設定を確認する。
2. @/ で始まるパスが、tsconfig.jsonの"paths"設定と一致するように修正する。
3. Jestで@/app/api/core/domain/entities/xxx などのimportが正しく解決されるようにする。
4. テストファイルでimportエラーが解消されることを確認する。

## 注意点

- tsconfig.jsonのpaths設定も参照し、Jest側のパス解決が一致するようにする。
- 既存の他のエイリアス設定も壊さないように注意する。
- 変更後は必ずテストを再実行し、importエラーが消えることを確認する。
