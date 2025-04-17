# FIX-GRAPHQL-001 Tournament型のcaptainsフィールドGraphQLエラー修正（fix）

## 概要

大会詳細画面で `Cannot query field "captains" on type "Tournament".` というGraphQLエラーが発生している。

## 実施内容

1. Tournament型のGraphQLスキーマ定義を確認し、`captains`フィールドが存在しない場合は追加する。
2. 必要に応じてリゾルバも実装する。
3. 型定義や関連箇所も修正する。
4. テスト・動作確認を行う。

## 注意点

- 既存のTournament型の設計意図を尊重し、不要なフィールド追加は避ける。
- captainsの型（例: User[] など）は既存設計や利用箇所を確認して決定する。
- 既存のGraphQLスキーマやDBスキーマとの整合性に注意する。
