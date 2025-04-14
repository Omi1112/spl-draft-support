# エンティティのDDDコーディング規約準拠タスク

## 概要

Domain-Driven Design（DDD）のベストプラクティスに従い、`/workspace/app/api/core/domain/entities/`内の各エンティティクラスをリファクタリングします。特に「関連するEntityはEntityのIDのみを保持し、Objectは保持しない」というDDDの原則に焦点を当てます。

## タスクの背景

現在のエンティティ実装は部分的にDDDのベストプラクティスに従っていますが、いくつかの不整合があります。特に：

1. 一部のエンティティでは関連オブジェクトを直接参照している
2. `static create`メソッドと`static reconstruct`メソッドの実装に一貫性がない
3. イミュータブル性の保証が不完全

## タスクリスト

### 1. Entityの依存関係の見直し

- [x] 各エンティティが他のエンティティオブジェクトではなく、IDのみを参照しているか確認
- [x] 直接オブジェクト参照を見つけた場合、IDのみの参照に修正

### 2. Tournamentエンティティの修正

- [x] `Tournament.ts`のフィールドとコンストラクタを確認し、不適切な依存関係を修正
- [x] `static create`メソッドの実装を規約に合わせて修正
- [x] `static reconstruct`メソッドの実装を規約に合わせて修正
- [x] ゲッター・セッターが適切に実装されているか確認

### 3. Participantエンティティの修正

- [x] `Participant.ts`のフィールドとコンストラクタを確認し、不適切な依存関係を修正
- [x] `static create`メソッドの実装を規約に合わせて修正
- [x] `static reconstruct`メソッドの実装を規約に合わせて修正
- [x] ゲッター・セッターが適切に実装されているか確認

### 4. Teamエンティティの修正

- [x] `Team.ts`のフィールドとコンストラクタを確認し、不適切な依存関係を修正
- [x] `static create`メソッドの実装を規約に合わせて修正
- [x] `static reconstruct`メソッドの実装を規約に合わせて修正
- [x] ゲッター・セッターが適切に実装されているか確認

### 5. Draftエンティティの修正

- [x] `Draft.ts`のフィールドとコンストラクタを確認し、不適切な依存関係を修正
- [x] `static create`メソッドの実装を規約に合わせて修正
- [x] `static reconstruct`メソッドの実装を規約に合わせて修正
- [x] ゲッター・セッターが適切に実装されているか確認

### 6. TournamentParticipantエンティティの修正

- [x] `TournamentParticipant.ts`のフィールドとコンストラクタを確認し、不適切な依存関係を修正
- [x] `static create`メソッドの実装を規約に合わせて修正
- [x] `static reconstruct`メソッドの実装を規約に合わせて修正
- [x] ゲッター・セッターが適切に実装されているか確認

### 7. コードレビューと動作確認

- [x] 変更による影響範囲を確認
- [x] コードレビューを実施
- [x] エラーなく動作するか確認

## DDDルールの重要ポイント

- **Entity**

  - 関係する Entity は Entity の ID だけ保有し、Object は保有しない
  - static create メソッドを定義し、Entity 生成とID初期値割り当てを行う
  - static reconstruct メソッドを定義し、Repository からデータ取得時にオブジェクト化を行う

- **ValueObject**

  - static create メソッドを定義
  - static reconstruct メソッドを定義
  - ID の ValueObject は uuid を利用する

- **Repository**
  - Entity と 1対1 の関係を持つ
  - Entity が関係する DB 以外の参照更新を行わない
  - mapToDomainEntity メソッドを実装し、リポジトリデータをドメインエンティティに変換
  - ロジックを持たない
  - シンプルな実装を心がける

## 影響範囲

- `/workspace/app/api/core/domain/entities/` 内の全てのエンティティクラス
- 上記エンティティを使用するリポジトリとユースケース
- 関連するテストコード
