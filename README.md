# セットアップ

# pnpm

これは [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) でブートストラップされた [Next.js](https://nextjs.org) プロジェクトです。

## はじめに

まず、開発サーバーを起動します:

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認します。

`app/page.tsx` を変更することでページの編集を開始できます。ファイルを編集するとページが自動的に更新されます。

このプロジェクトでは、[Geist](https://vercel.com/font) という新しいフォントファミリーを自動的に最適化して読み込むために [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使用しています。

## Prisma マイグレーションコマンド

このプロジェクトでは Prisma ORM を使用しています。以下は最も一般的に使用される Prisma マイグレーションコマンドです:

```bash
# スキーマの変更から新しいマイグレーションを生成
npx prisma migrate dev --name <migration-name>

# 本番環境でマイグレーションを適用
npx prisma migrate deploy

# データベースをリセットしてすべてのマイグレーションを適用
npx prisma migrate reset

# マイグレーションのステータスを確認
npx prisma migrate status

# Prisma クライアントを生成
npx prisma generate

# Prisma Studio を開いてデータを表示および編集
npx prisma studio
```

データベース接続文字列が `.env` ファイルに正しく設定されていることを確認してください:

```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## 詳しく学ぶ

Next.js について詳しく学ぶには、以下のリソースを参照してください:

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能と API について学びます。
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル。

[Next.js GitHub リポジトリ](https://github.com/vercel/next.js) をチェックしてみてください - フィードバックや貢献をお待ちしています！

## Vercel でデプロイ

Next.js アプリをデプロイする最も簡単な方法は、Next.js の作成者による [Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を使用することです。

詳細については、[Next.js デプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying) をご覧ください。

# GraphQL API プロジェクト

## DDD + GraphQL アーキテクチャ - 開発ガイドライン

### ユースケース追加・修正時のチェックリスト

機能追加・修正を行う際は、以下のチェックリストに従ってレイヤー間の整合性を確保してください:

#### 1. ドメイン層

- [ ] 新しいエンティティ・値オブジェクトの作成
- [ ] 既存のエンティティ・値オブジェクトの修正
- [ ] リポジトリインターフェースの更新

#### 2. アプリケーション層

- [ ] 新しいユースケースの追加
- [ ] DTO の定義・更新
- [ ] ユースケーステストの作成

#### 3. インフラストラクチャ層

- [ ] リポジトリ実装の追加・修正
- [ ] Prisma スキーマの更新（必要な場合）
- [ ] マイグレーションの作成と適用

#### 4. GraphQL レイヤー

- [ ] スキーマ定義（typeDefs）の更新
  - [ ] 新しい型の追加
  - [ ] クエリの追加・修正
  - [ ] ミューテーションの追加・修正
- [ ] リゾルバの実装
  - [ ] 新しいリゾルバの作成
  - [ ] 既存リゾルバの修正
- [ ] GraphQL スキーマとリゾルバの整合性テスト実行

#### 5. クライアント層

- [ ] クライアント用の GraphQL クエリ・ミューテーション定義
- [ ] コンポーネントの更新
- [ ] フックの更新

### GraphQL スキーマとリゾルバの整合性確認

新しい機能を追加する際は、必ず以下のテストを実行して整合性を確認してください:

```bash
npm test -- __tests__/api/graphql/schema-resolver-consistency.test.ts
```

### 機能追加の一般的なフロー

1. ドメイン層（エンティティ、値オブジェクト）の設計と実装
2. アプリケーション層（ユースケース）の実装
3. インフラストラクチャ層（リポジトリ実装）の実装
4. GraphQL スキーマの更新
5. リゾルバの実装・更新
6. スキーマとリゾルバの整合性テスト
7. クライアント側の実装・更新

このフローに従うことで、各レイヤー間の整合性を確保し、保守性の高いアプリケーションを維持できます。
