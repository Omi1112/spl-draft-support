// filepath: /workspace/app/api/core/domain/entities/Tournament.test.ts
import { Tournament } from '@/app/api/core/domain/entities/Tournament';
import { DraftStatus } from '@/app/api/core/domain/valueObjects/DraftStatus';

describe('Tournamentエンティティ', () => {
  it('createでインスタンス生成できる', () => {
    // 実行
    const tournament = Tournament.create('テストトーナメント');

    // 検証
    expect(tournament).toBeDefined();
    expect(tournament.id).toBeDefined();
    expect(tournament.nameValue).toBe('テストトーナメント');
    expect(tournament.createdAt).toBeInstanceOf(Date);
    expect(tournament.draftStatus).toBeDefined();
    expect(tournament.draftStatus?.round).toBe(0);
    expect(tournament.draftStatus?.turn).toBe(0);
    expect(tournament.draftStatus?.isActive).toBe(false);
  });

  describe('reconstruct', () => {
    it('既存のデータからトーナメントを再構築できること', () => {
      // 準備
      const id = 'test-id';
      const name = 'テストトーナメント';
      const createdAt = new Date();
      const draftStatus = DraftStatus.create();

      // 実行
      const tournament = Tournament.reconstruct(id, name, createdAt, draftStatus);

      // 検証
      expect(tournament).toBeDefined();
      expect(tournament.id.value).toBe(id);
      expect(tournament.nameValue).toBe(name);
      expect(tournament.createdAt).toBe(createdAt);
      expect(tournament.draftStatus).toBe(draftStatus);
    });

    it('不正な名前で再構築しようとするとエラーになること', () => {
      // 準備
      const id = 'test-id';
      const name = ''; // 空の名前
      const createdAt = new Date();
      const draftStatus = DraftStatus.create();

      // 実行と検証
      expect(() => Tournament.reconstruct(id, name, createdAt, draftStatus)).toThrow(
        '大会名は必須です'
      );
    });
  });

  describe('ドラフト操作', () => {
    it('ドラフトを開始できること', () => {
      // 準備
      const tournament = Tournament.create('テストトーナメント');

      // 実行前の状態確認
      expect(tournament.draftStatus?.isActive).toBe(false);
      expect(tournament.draftStatus?.round).toBe(0);
      expect(tournament.draftStatus?.turn).toBe(0);

      // 実行
      tournament.startDraft();

      // 検証
      expect(tournament.draftStatus?.isActive).toBe(true);
      expect(tournament.draftStatus?.round).toBe(1);
      expect(tournament.draftStatus?.turn).toBe(1);
    });

    it('ドラフトをリセットできること', () => {
      // 準備
      const tournament = Tournament.create('テストトーナメント');

      // ドラフト開始
      tournament.startDraft();
      expect(tournament.draftStatus?.isActive).toBe(true);

      // 実行
      tournament.reset();

      // 検証
      expect(tournament.draftStatus?.isActive).toBe(false);
      expect(tournament.draftStatus?.round).toBe(0);
      expect(tournament.draftStatus?.turn).toBe(0);
    });

    it('ドラフトステータスを更新できること', () => {
      // 準備
      const tournament = Tournament.create('テストトーナメント');
      const newDraftStatus = new DraftStatus(2, 3, true);

      // 実行
      tournament.updateDraftStatus(newDraftStatus);

      // 検証
      expect(tournament.draftStatus).toBe(newDraftStatus);
      expect(tournament.draftStatus?.round).toBe(2);
      expect(tournament.draftStatus?.turn).toBe(3);
      expect(tournament.draftStatus?.isActive).toBe(true);
    });
  });
});
