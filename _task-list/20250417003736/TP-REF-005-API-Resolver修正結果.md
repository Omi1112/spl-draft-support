# TP-REF-005 API/Resolver修正 結果

## 実施内容

- GraphQLリゾルバ/API層のTournamentParticipant/Participant利用箇所を調査し、TournamentParticipant主軸・Participantネスト型へ統一。
- 返却値・引数・型定義を設計方針に従い修正。
- 既存のクエリ・ミューテーション・テストが壊れないように段階的にリファクタリング。
- 変更点・注意点をコメント・ドキュメントに反映。

## 主な修正点

- 参加者追加/取得APIの返却値をTournamentParticipant主軸・Participantネスト型に統一。
- Participant単体返却箇所をTournamentParticipant経由に修正。

## 次タスク

TP-REF-006 テスト修正・追加

---

参照: .github/copilot-instructions.md
