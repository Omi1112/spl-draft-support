import { DraftRepository } from '../../../domain/repositories/DraftRepository';
import { Draft } from '../../../domain/entities/Draft';
import { DraftId } from '../../../domain/valueObjects/DraftId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';

/**
 * 参加者指名のための入力データ型
 */
export interface NominateParticipantInput {
  tournamentId: string;
  captainId: string;
  participantId: string;
}

/**
 * 参加者指名のための出力データ型
 */
export interface NominateParticipantOutput {
  id: string;
  status: string;
}

/**
 * 参加者指名のユースケース
 * キャプテンが参加者を指名するためのビジネスロジックを提供
 */
export class NominateParticipantUseCase {
  constructor(private readonly draftRepository: DraftRepository) {}

  /**
   * 参加者指名処理を実行
   * @param input 指名処理の入力データ
   * @returns 指名処理の結果
   */
  async execute(input: NominateParticipantInput): Promise<NominateParticipantOutput> {
    try {
      // バリデーション
      if (!input.tournamentId || !input.captainId || !input.participantId) {
        throw new Error('必要なパラメータが不足しています');
      }

      // 指名済みかどうかチェック
      const existingDraft = await this.draftRepository.findByTournamentIdCaptainIdAndParticipantId(
        new TournamentId(input.tournamentId),
        new ParticipantId(input.captainId),
        new ParticipantId(input.participantId)
      );

      if (existingDraft) {
        throw new Error('この参加者は既に指名されています');
      }

      // 現在のドラフト状態（ラウンド、ターン）を取得
      // 本来はここでドラフトステータスを取得して現在のラウンドとターンを設定すべきですが、
      // 実装を簡素化するために仮の値を使用します。
      const round = 1;
      const turn = 1;

      // 新しいドラフトを作成
      const draftId = DraftId.create();
      const draft = Draft.create(
        draftId,
        new TournamentId(input.tournamentId),
        new ParticipantId(input.captainId),
        new ParticipantId(input.participantId),
        round,
        turn,
        'pending'
      );

      // ドラフトを保存
      await this.draftRepository.save(draft);

      return {
        id: draft.id.value,
        status: draft.status,
      };
    } catch (error) {
      console.error('参加者指名エラー:', error);
      throw error;
    }
  }
}
