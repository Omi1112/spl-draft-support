# タスク詳細: useTournamentDetails統合テスト期待値修正

## タスクID

FIX-TEST-EXPECT-002

## タスク名

useTournamentDetails統合テスト期待値修正

## タスク種類

implementation

## 概要

useTournamentDetailsのテストで返却値shapeの不一致を修正する。

## 実施手順

1. **tests**/tournaments/[id]/hooks/useTournamentDetails.test.ts のテスト内容を確認する。
2. 実装側の返却値（result.current）に含まれるプロパティを確認し、テストの期待値（toEqualの引数）を最新のshapeに合わせて修正する。
3. テストが通ることを確認する。

## 注意点

- 実装側の返却値shapeが変わった場合は、テストの期待値も必ず合わせる。
- 追加されたプロパティや関数は漏れなくテスト期待値に含める。
- テストの可読性・保守性も意識して修正する。
