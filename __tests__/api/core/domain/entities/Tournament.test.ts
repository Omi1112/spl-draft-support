// Tournamentエンティティのテスト
// コメントは日本語で記載
import { Tournament } from '@/app/api/core/domain/entities/Tournament';
import { TournamentId } from '@/app/api/core/domain/valueObjects/TournamentId';
import { DraftStatus } from '@/app/api/core/domain/valueObjects/DraftStatus';

describe('Tournamentエンティティ', () => {
  // createメソッドのテスト
  it('createでインスタンス生成できる', () => {
    const tournament = Tournament.create('大会A');
    expect(tournament).toBeInstanceOf(Tournament);
    expect(tournament.name).toBe('大会A');
    expect(tournament.id).toBeInstanceOf(TournamentId);
    expect(tournament.createdAt).toBeInstanceOf(Date);
    expect(tournament.draftStatus).toBeInstanceOf(DraftStatus);
  });

  // reconstructメソッドのテスト
  it('reconstructでインスタンス復元できる', () => {
    const now = new Date();
    const draftStatus = DraftStatus.create();
    const tournament = Tournament.reconstruct('tournament-1', '大会B', now, draftStatus);
    expect(tournament).toBeInstanceOf(Tournament);
    expect(tournament.id.value).toBe('tournament-1');
    expect(tournament.name).toBe('大会B');
    expect(tournament.createdAt).toBe(now);
    expect(tournament.draftStatus).toBe(draftStatus);
  });

  // draftStatus関連メソッドのテスト
  it('startDraft/reset/updateDraftStatusが正しく動作する', () => {
    const tournament = Tournament.create('大会C');
    const originalStatus = tournament.draftStatus;
    tournament.startDraft();
    expect(tournament.draftStatus).not.toBe(originalStatus);
    const startedStatus = tournament.draftStatus;
    tournament.reset();
    expect(tournament.draftStatus).not.toBe(startedStatus);
    const newStatus = DraftStatus.create();
    tournament.updateDraftStatus(newStatus);
    expect(tournament.draftStatus).toBe(newStatus);
  });
});
