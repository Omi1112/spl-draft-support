# TP-REF-004 サービス/ユースケース修正 結果

## 実施内容

- サービス・ユースケース層のTournamentParticipant/Participant利用箇所を調査し、TournamentParticipant主軸・Participantネスト型へ統一。
- DTO・返却値・引数等を設計方針に従い修正。
- 既存のロジック・テストが壊れないように段階的にリファクタリング。
- 変更点・注意点をコメント・ドキュメントに反映。

## 主な修正点

- 参加者追加・取得・キャプテン切替等のユースケースでTournamentParticipant主軸のDTO/返却値に統一。
- Participant単体利用箇所をTournamentParticipant経由に修正。

## 次タスク

TP-REF-005 API/Resolver修正

---

参照: .github/copilot-instructions.md
