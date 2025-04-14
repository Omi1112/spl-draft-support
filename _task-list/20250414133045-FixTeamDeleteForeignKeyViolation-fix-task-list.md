# ドラフトリセット機能における外部キー制約違反の修正

## 背景

ドラフトリセット機能を実行する際に、外部キー制約違反のエラーが発生しています。Team エンティティを削除する前に、関連する TeamMember エンティティを先に削除する必要があります。

## エラー内容

```
Foreign key constraint violated: `TeamMember_teamId_fkey (index)`
```

このエラーは、TeamMember テーブルが Team テーブルの ID を外部キーとして参照しているため、Team を削除する前に TeamMember を削除する必要があることを示しています。

## タスクリスト

### 1. コード分析

- [x] PrismaTeamRepository.deleteByTournamentId メソッドの現在の実装を確認
- [x] TeamMemberRepository の実装を確認
- [x] DraftDomainService.resetDraft メソッドの実装を確認
- [x] 関連するエンティティ間の依存関係を分析

### 2. PrismaTeamRepository の修正

- [x] PrismaTeamRepository.deleteByTournamentId メソッドを修正し、関連する TeamMember を先に削除するロジックを追加
- [x] トランザクションを使用して、削除操作を一貫性のある単一の操作として実行

### 3. DraftDomainService の修正

- [ ] DraftDomainService.resetDraft メソッドが適切な順序で削除処理を行っているか確認
- [ ] 必要に応じて、チームメンバー削除とチーム削除の順序を修正
- [ ] エラーハンドリングを強化し、より具体的なエラーメッセージを提供

### 4. テスト

- [ ] 修正された機能をテストし、エラーが解消されたことを確認
- [ ] ドラフトリセット機能が正常に動作することを確認
- [ ] エッジケース（例：チームが存在しない場合など）のテスト

### 5. ドキュメント更新

- [ ] コードにコメントを追加して、削除順序とその理由を説明
- [ ] 必要に応じて、関連するドキュメントを更新

### 6. リファクタリング（オプション）

- [ ] リポジトリパターンの実装を見直し、より堅牢なデータ操作方法を検討
- [ ] カスケード削除の設定を検討し、適切な場所に適用
