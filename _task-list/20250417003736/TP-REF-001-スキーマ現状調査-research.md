# TP-REF-001 スキーマ現状調査（research）

## 概要

TournamentParticipantとParticipantの現状利用箇所・責務の調査を行い、現状の問題点や改善ポイントを洗い出します。

## 実施手順

1. GraphQLスキーマ（`app/api/graphql/types/index.ts`）におけるTournamentParticipant/Participantの定義・関係性を確認する。
2. サービス層・ユースケース層・API層・テスト層で両者がどのように使われているかgrep等で調査する。
3. 現状の責務分担・利用タイミングの問題点を整理し、次タスク（設計方針策定）に繋げる。

## 注意点

- PrismaスキーマやTypeScript型定義も合わせて参照すること。
- 既存のテストケースも調査対象に含めること。
- 調査結果は次タスクで設計方針を決めるための材料とする。
