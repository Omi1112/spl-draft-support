# 事前読み込み

- prompt/index.md
- prompt/rule.md
- prompt/dir.md
- prompt/reflection.md

# 実現したい事

```
{
    "errors": [
        {
            "message": "Cannot query field \"id\" on type \"TournamentParticipant\".",
            "locations": [
                {
                    "line": 4,
                    "column": 9
                }
            ],
            "extensions": {
                "code": "GRAPHQL_VALIDATION_FAILED"
            }
        },
        {
            "message": "Cannot query field \"tournamentId\" on type \"TournamentParticipant\". Did you mean \"Tournament\"?",
            "locations": [
                {
                    "line": 5,
                    "column": 9
                }
            ],
            "extensions": {
                "code": "GRAPHQL_VALIDATION_FAILED"
            }
        },
        {
            "message": "Cannot query field \"participantId\" on type \"TournamentParticipant\". Did you mean \"Participant\"?",
            "locations": [
                {
                    "line": 6,
                    "column": 9
                }
            ],
            "extensions": {
                "code": "GRAPHQL_VALIDATION_FAILED"
            }
        }
    ]
}
```

# タスク

- prompt/task_history/YYYYMMDDHHMMSS.md を作成してください。(YYYYMMDDHHMMSS はタイムスタンプを設定してください。)
- prompt/task_sample.md の内容を作成した md ファイルにコピーしてください。
- やりたいことを実現するための TODO リストを md ファイルに出力してください。
- タスクを実現するために特に必要な情報を以下ファイル群から、mdファイルに出力してください。
  - prompt/index.md
  - prompt/rule.md
  - prompt/dir.md
  - prompt/reflection.md
