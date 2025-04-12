# プロジェクトディレクトリ構成

```
/workspace/
├── app/                           # Next.jsアプリケーションのメインディレクトリ
│   ├── api/                       # APIエンドポイント
│   │   ├── core/                  # コアビジネスロジック
│   │   │   ├── application/       # アプリケーション層
│   │   │   ├── domain/            # ドメイン層
│   │   │   └── infrastructure/    # インフラストラクチャ層
│   │   └── graphql/               # GraphQL API
│   │       ├── resolvers/         # GraphQLリゾルバ
│   │       ├── types/             # GraphQLタイプ定義
│   │       ├── route.ts           # APIルート定義
│   │       └── schema.ts          # GraphQLスキーマ
│   ├── client/                    # クライアントサイドコード
│   ├── components/                # Reactコンポーネント
│   ├── hooks/                     # Reactフック hooksはpageディレクトリにhooksディレクトリを配置してください。
│   ├── utils/                     # ユーティリティ関数
│   ├── favicon.ico                # ファビコン
│   ├── globals.css                # グローバルCSS
│   ├── layout.tsx                 # レイアウト
│   └── page.tsx                   # メインページ
│
├── __tests__/                     # テストディレクトリ
├── prisma/                        # Prismaデータベース関連
│   ├── migrations/                # データベースマイグレーション
│   └── schema.prisma              # Prismaスキーマ定義
│
├── public/                        # 静的アセット
│
├── types/                         # グローバル型定義
│   └── jest-dom.d.ts
│
├── base_prompt.md                 # ベースプロンプト
├── dir.md                         # ディレクトリ構成説明（このファイル）
├── index.md                       # プロジェクト概要
├── jest.config.js                 # Jestの設定
├── jest.setup.js                  # Jestのセットアップ
├── next-env.d.ts                  # Next.jsの環境型定義
├── next.config.ts                 # Next.jsの設定
├── package.json                   # 依存関係とスクリプト
├── postcss.config.mjs             # PostCSSの設定
├── README.md                      # プロジェクト説明
├── rule.md                        # プロジェクトルール
├── task.md                        # タスク一覧
├── tsconfig.json                  # TypeScriptの設定
└── tsconfig.tsbuildinfo           # TypeScriptビルド情報
```
