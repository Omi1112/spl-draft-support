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
