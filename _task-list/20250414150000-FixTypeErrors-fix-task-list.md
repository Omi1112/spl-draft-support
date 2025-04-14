# 型エラー修正タスクリスト

## 概要

TypeScriptの型チェックで検出された型エラーを修正するタスクリストです。

## タスク

### 1. 基本的なエンティティの型エラー修正

- [x] `Tournament`エンティティに`addParticipant`メソッドがないため修正

  - 対象ファイル: `app/api/core/application/useCases/participant/AddParticipantToTournamentUseCase.ts`
  - エラー内容: `Property 'addParticipant' does not exist on type 'Tournament'`

- [x] `Participant`エンティティの`assignTeam`メソッド名が間違っているため修正
  - 対象ファイル: `app/api/core/application/useCases/team/CreateTeamUseCase.ts`
  - エラー内容: `Property 'assignTeam' does not exist on type 'Participant'. Did you mean 'assignToTeam'?`

### 2. DTOの型エラー修正

- [x] `ParticipantDTO`に`isCaptain`プロパティがないため修正

  - 対象ファイル: `app/api/graphql/resolvers/participantResolvers.ts`
  - エラー内容: `Property 'isCaptain' does not exist on type 'ParticipantDTO'`
  - 2箇所（182行目と256行目）で同じエラーが発生しています

- [~] `TournamentParticipantDTO`に`id`プロパティがないため修正
  - 対象ファイル: `app/api/graphql/resolvers/tournamentResolvers.ts`
  - エラー内容: `Property 'id' does not exist on type 'TournamentParticipantDTO'`

### 3. テストファイルの型エラー修正

- [ ] `Tournament`型に`participants`プロパティが存在しないため修正
  - 対象ファイル: `__tests__/tournaments/[id]/hooks/useTournamentData.test.ts`
  - エラー内容: `Object literal may only specify known properties, and 'participants' does not exist in type 'Tournament'`

## 作業中に発見したタスク

（作業中に新たなタスクが見つかった場合、ここに追加します）
