// Draftエンティティのテスト
// コメントは日本語で記載
import { Draft } from '@/app/api/core/domain/entities/Draft';
import { DraftId } from '@/app/api/core/domain/valueObjects/DraftId';
import { TournamentId } from '@/app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '@/app/api/core/domain/valueObjects/ParticipantId';

// モック用のID生成
const mockDraftId = DraftId.reconstruct('draft-id-1');
const mockTournamentId = TournamentId.reconstruct('tournament-id-1');
const mockCaptainId = ParticipantId.reconstruct('captain-id-1');
const mockParticipantId = ParticipantId.reconstruct('participant-id-1');

describe('Draftエンティティ', () => {
  // createメソッドのテスト
  it('createでインスタンス生成できる', () => {
    const draft = Draft.create(mockTournamentId, mockCaptainId, mockParticipantId, 1, 1, 'active');
    // インスタンスがDraftであること
    expect(draft).toBeInstanceOf(Draft);
    // 各プロパティが正しくセットされていること
    expect(draft.tournamentId).toEqual(mockTournamentId);
    expect(draft.captainId).toEqual(mockCaptainId);
    expect(draft.participantId).toEqual(mockParticipantId);
    expect(draft.round).toBe(1);
    expect(draft.turn).toBe(1);
    expect(draft.status).toBe('active');
    expect(draft.createdAt).toBeInstanceOf(Date);
  });

  // reconstructメソッドのテスト
  it('reconstructでインスタンス復元できる', () => {
    const now = new Date();
    const draft = Draft.reconstruct(
      'draft-id-1',
      'tournament-id-1',
      'captain-id-1',
      'participant-id-1',
      2,
      3,
      'done',
      now
    );
    expect(draft).toBeInstanceOf(Draft);
    expect(draft.id.value).toBe('draft-id-1');
    expect(draft.tournamentId.value).toBe('tournament-id-1');
    expect(draft.captainId.value).toBe('captain-id-1');
    expect(draft.participantId.value).toBe('participant-id-1');
    expect(draft.round).toBe(2);
    expect(draft.turn).toBe(3);
    expect(draft.status).toBe('done');
    expect(draft.createdAt).toBe(now);
  });
});
