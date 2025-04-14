# タスク: nominateParticipantミューテーションの実装確認

## 概要

GraphQLスキーマに`NominateParticipantInput`型が追加された後、対応する`nominateParticipant`ミューテーションが正しく実装されているか確認し、必要に応じて修正を行う必要があります。

## 目的

参加者指名機能のエラーを完全に解消するために、ミューテーションの実装を確認し、必要な修正を行います。

## 実行手順

1. GraphQLリゾルバファイル（関連するリゾルバファイルを特定）を確認し、`nominateParticipant`ミューテーションの実装を確認する
2. 実装が存在しない場合は、適切なリゾルバファイルに`nominateParticipant`ミューテーションの実装を追加する
3. 既存の実装がある場合は、新しい型定義と整合性が取れていることを確認する
4. クライアント側からの呼び出し方法が正しいか確認する
5. 修正後、エラーが解消されたことを確認する

## 実装詳細

実装すべきミューテーションリゾルバの基本構造:

```typescript
nominateParticipant: async (_: Context, { input }: { input: NominateParticipantInput }) => {
  try {
    // 実装ロジック
    // ...

    return {
      id: 'draft-id',
      status: 'pending',
      // その他の必要なフィールド
    };
  } catch (error) {
    // エラーハンドリング
    return handleError(error, '参加者の指名に失敗しました');
  }
};
```

## 注意点

- ドメイン層の適切なユースケースを呼び出すように実装する
- エラーハンドリングを適切に行う
- ミューテーションの戻り値の型が正しく定義されているか確認する
- トランザクション処理が必要な場合は適切に実装する
