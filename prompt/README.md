# 概要

copilot エージェントを活用するための prompt 集です。

# 手順

### 事前準備(clone 後一回だけ)

1. task_create_sample.md をコピーして task_create.md を作成してください。
1. reflection_create_sample.md をコピーして reflection_create.md を作成してください。

# 都度対応

### タスク実行

1. 実現したい事を task_create.md に記載して、copilot エージェントのプロンプトとして実行してください。
1. 生成された task_history/ディレクトリのファイル を copilot エージェントのプロンプトとして実行してください。
1. 実行結果を確認して問題があれば、reflection_create.md にエラー内容などを記入して、copilot エージェントのプロンプトとして実行してください。
1. todo_history に新たなファイルができたら copilot エージェントのプロンプトとして実行してください。
1. エラー修正などは、最初の 1 番に戻り、実現したい事としてエラー内容を張り付けるなどして作業を進めてください。

### 型修正

1. type_fix.mdのプロンプトを実行して、型修正する。
1. type_fix_after.mdのプロンプトを実行して、ノウハウを蓄積させる。
