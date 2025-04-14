# 型エラー修正タスクリスト

## 概要

このタスクリストは、プロジェクト内の型エラーを修正するためのものです。型チェックによって検出された36個のエラーに対応します。

## タスク一覧

### ParticipantListコンポーネント関連

- [x] ParticipantList.test.tsxの型エラー修正（5件）
  - `participants`プロパティが`ParticipantListProps`型に存在しない問題を修正

### TournamentInfoコンポーネント関連

- [x] TournamentInfo.test.tsxの型エラー修正（2件）
  - Tournament型に`participants`プロパティがない問題を修正

### フック関連

- [x] useCaptainManagement.test.tsの型エラー修正（1件）
  - Tournament型に`participants`プロパティがない問題を修正
- [x] useParticipantForm.test.tsの型エラー修正（6件）
  - Tournament型に必要なプロパティ`tournamentParticipants`が欠けている問題を修正
- [x] useTournamentData.test.tsの型エラー修正（4件）
  - Tournament型に`participants`プロパティがない問題を修正

### ドメイン層とアプリケーション層関連

- [x] UpdateDraftStatusUseCase.tsの型エラー修正（3件）
  - `status`プロパティが存在しない問題を解決
- [x] AddParticipantToTournamentUseCase.tsの型エラー修正（4件）
  - `status`プロパティの参照問題と変数名の誤りを修正
  - 引数の数が不正な問題を修正
- [x] AddParticipantUseCase.tsの型エラー修正（2件）
  - privateコンストラクタの不正な直接呼び出し
  - 存在しないメソッド`addParticipantId`の呼び出し
- [x] CreateTeamUseCase.tsの型エラー修正（2件）
  - privateコンストラクタの不正な直接呼び出し
  - 存在しないメソッド`addTeamId`の呼び出し
- [x] GetTournamentUseCase.tsの型エラー修正（2件）
  - `status`プロパティが型定義に存在しない問題を修正

### インフラストラクチャ層関連

- [x] PrismaDraftRepository.tsの型エラー修正（1件）
  - privateコンストラクタの不正な直接呼び出し
- [x] PrismaTeamRepository.tsの型エラー修正（1件）
  - 引数の数が不正な問題を修正（`createdAt`が不足）
- [x] PrismaTournamentParticipantRepository.tsの型エラー修正（1件）
  - privateコンストラクタの不正な直接呼び出し

### GraphQL リゾルバ関連

- [x] participantResolvers.tsの型エラー修正（1件）
  - `AddParticipantDTO`に必要なプロパティ（`weapon`, `xp`）が欠けている問題を修正
- [x] tournamentResolvers.tsの型エラー修正（1件）
  - `TournamentParticipantDTO`に`id`プロパティが存在しない問題を修正

## 作業中に発見された問題

- [ ] テスト全体でTournament型の期待値と実際の型が一致していない可能性がある
- [ ] エンティティのコンストラクタがprivateの場合、ファクトリメソッドやreconstructメソッドを使うよう変更が必要
- [ ] DTOとエンティティ間の型の不一致が複数箇所で発生している

## 完了条件

- 全ての型エラーが解消され、`npm run typecheck`が成功すること
- テストが正常に実行できること
