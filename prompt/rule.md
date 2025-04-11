### 作業ルール

- 不明点が出た場合 Web_fetch して 検索をしてください。
- 「厳格な型チェック（strict type checking）を使用したTypeScriptコードを生成してください」
- 「null/undefinedの可能性を考慮した安全なコードを書いてください」
- `app/api`ディレクトリは BE 実装であり FE 実装から参照を行わないでください。
- FE 実装で BE API を呼び出すときは、は、`app/client`ディレクトリに呼び出しファイルを作成してください。
- 編集作業は cat などコマンドで編集せずファイル編集機能で作成してください。
- ファイルの作成は cat や touch コマンドを使用せずファイル変種機能で作成してください。
- api ディレクトリは、DDD を採用しています。適切に分離してください。
- `npm run format` を実行して全体フォーマットをして完了してください。
- 後方互換性のためのメソッドを基本的に作成しないでください。

### DDD ルール

- Entity

  - 関係するEntityはEntityのIDだけ保有してObjectは保有しない。
  - static createメソッドを定義する。
    　- createメソッドは、Entityを生成するためのメソッドでありIDの初期値割り当てなどを
  - static reconstructメソッドを定義する。
    　- reconstructメソッドは、Entityを復元するためのメソッドであり基本的にRepositoryからデータを取得する時にオブジェクト化する時に利用する。

- ValueObject

  - static createメソッドを定義する。
    　- createメソッドは、Entityを生成するためのメソッドでありIDの初期値割り当てなどを
  - static reconstructメソッドを定義する。
    　- reconstructメソッドは、Entityを復元するためのメソッドであり基本的にRepositoryからデータを取得する時にオブジェクト化する時に利用する。
  - IDのValueObjectの場合uuidを利用する。
  - 基本的にIDの派生クラスには基底クラスで定義したものをオーバーライドしないでください。
  - 定数を取り扱う時は定数を定義して、ValueObject外で参照させないでください。
    - 例えばstatusの場合 文字列inprogressの状態かどうか外部から確認するためには、ValueObjectのメソッドを利用して確認するようにしてください。

- Repository

  - Entityと1対1の関係を持ち、Entityが関係するDB以外の参照更新を行わない。
  - mapToDomainEntityメソッドを持ち、リポジトリから取得したデータをドメインエンティティに変換するためのメソッドである。
  - リポジトリは、ロジックを持たない。
  - 極力シンプルな形で実装を行う。

- UseCaseとservices

  - repositoryやentityを利用してドメインロジックを実装する。
  - トランザクションはこの層で張る。
