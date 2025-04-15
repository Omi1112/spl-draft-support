# startDraft関数の戻り値型の不一致修正

## 問題概要

GraphQLエラー「Cannot return null for non-nullable field Team.id.」が発生しています。このエラーは、`startDraft`ミューテーションの戻り値に関連しており、`DraftDomainService.startDraft`メソッドが配列を返している一方で、`StartDraftUseCase.execute`メソッドの戻り値型が単一の`Team`オブジェクトと宣言されているという型の不一致によって引き起こされています。

## タスク一覧

### 修正と実装

- [ ] DraftDomainServiceとStartDraftUseCaseの戻り値型の不一致を調査する
- [ ] StartDraftUseCaseの戻り値型を修正する（配列の最初の要素を返すか、型を変更する）
- [ ] 必要に応じてGraphQLスキーマを修正する
- [ ] 修正後の動作確認を行う

### 発見した場合に追加タスク
