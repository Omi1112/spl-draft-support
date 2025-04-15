# タスク詳細: ParticipantList型・データ流し込み修正

## タスクID

FIX-PARTICIPANT-LIST-003

## タスク名

ParticipantList型・データ流し込み修正

## タスク種類

implementation

## 概要

ParticipantListのtournamentParticipants型・データ流し込みを修正しTypeErrorを解消する。

## 実施手順

1. app/components/tournaments/ParticipantList.tsx のtournamentParticipantsの型定義・受け取り方を確認する。
2. tournamentParticipantsが必ずiterable（配列）として渡るように修正する。
3. 呼び出し元（親コンポーネント）でのデータ流し込みも確認し、必要に応じて修正する。
4. テストでTypeErrorが発生しないことを確認する。

## 注意点

- 型安全性を担保し、any型やunknown型は使わない。
- tournamentParticipantsがundefinedやnullの場合も考慮し、空配列をデフォルト値とするなどの防御的実装を行う。
- 既存の他の機能に影響を与えないように注意する。
