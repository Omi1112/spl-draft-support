# トーナメント管理システム - プロジェクト概要

## プロジェクト構造

このプロジェクトは Next.js、Prisma、GraphQL を使用したトーナメント管理システムです。

### 技術スタック

- **フロントエンド**: Next.js (React)
- **バックエンド**: Next.js API Routes with GraphQL
- **データベース**: Prisma ORM
- **テスト**: Jest

### 主要機能

1. **トーナメント管理**

   - トーナメントの作成
   - 参加者/チームの追加と管理
   - キャプテン機能

2. **ドラフトシステム**

   - ドラフトのラウンドと順番管理
   - ドラフトステータスの追跡

3. **参加者管理**
   - チーム編成
   - 参加者リスト

## コアコンポーネント

### フロントエンド

- `app/page.tsx` - メインページ
- `app/tournaments/[id]/page.tsx` - トーナメント詳細ページ
- `app/tournaments/create/page.tsx` - トーナメント作成ページ
- `app/components/tournaments/` - トーナメント関連コンポーネント
  - `TournamentInfo.tsx` - トーナメント情報表示
  - `ParticipantList.tsx` - 参加者リスト
  - `TeamList.tsx` - チームリスト
  - `AddParticipantModal.tsx` - 参加者追加モーダル

### バックエンド

- `app/api/graphql/` - GraphQL API エンドポイント
  - `route.ts` - API ルート定義
  - `schema.ts` - GraphQL スキーマ
  - `resolvers/` - GraphQL リゾルバ

### データベース

- `prisma/schema.prisma` - データベーススキーマ定義
- 主要なテーブル:
  - トーナメント (Tournament)
  - 参加者 (Participant)
  - チーム (Team)
  - ドラフト (Draft)
  - ドラフトステータス (DraftStatus)

## データモデル

データベースは以下の構造を持っています（Prisma スキーマより抽出）:

1. トーナメントテーブル
2. 参加者テーブル
3. トーナメント参加者関連テーブル
4. チームテーブル
5. ドラフトテーブル
6. ドラフトステータステーブル

## 開発環境

- TypeScript
- Next.js
- Prisma ORM
- Jest テストフレームワーク
- Debian GNU/Linux 12 (bookworm) 上の開発コンテナ

## ビルドとテスト

テストは Jest を使用して実装されています。テストカバレッジレポートも生成されます。
