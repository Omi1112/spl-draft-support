# タスク: NominateParticipantInput型の定義追加

## 概要

キャプテン詳細ページで参加者を指名する際に「Unknown type "NominateParticipantInput". Did you mean "CreateParticipantInput" or "ParticipantInput"?」というエラーが発生しています。このエラーはGraphQLスキーマに`NominateParticipantInput`型が定義されていないにもかかわらず、APIクライアント側でこの型を使用しようとしていることが原因です。

## 目的

GraphQLスキーマに`NominateParticipantInput`型を追加して、参加者指名機能のエラーを解消します。

## 実行手順

1. GraphQLスキーマファイル(`/workspace/app/api/graphql/types/index.ts`)を確認し、現在の型定義を確認する
2. `NominateParticipantInput`型の定義を追加する
3. `nominateParticipant`ミューテーションの定義を追加または確認する
4. 修正後、エラーが解消されたことを確認する

## 実装詳細

追加すべき型定義:

```graphql
input NominateParticipantInput {
  tournamentId: ID!
  captainId: ID!
  participantId: ID!
}
```

## 注意点

- 既存のGraphQLスキーマ構造を崩さないように注意する
- 型定義だけでなく、関連するミューテーションも確認する必要がある
- スキーマの変更がクライアント側のコードと整合性があることを確認する
