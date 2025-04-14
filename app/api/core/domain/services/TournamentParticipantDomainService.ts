import { TournamentParticipant } from '../entities/TournamentParticipant';
import { TournamentParticipantRepository } from '../repositories/TournamentParticipantRepository';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TournamentId } from '../valueObjects/TournamentId';

/**
 * トーナメント参加者のドメインサービス
 * 複数のエンティティにまたがるロジックや、エンティティ単体では表現できないドメインロジックを実装
 */
export class TournamentParticipantDomainService {
  constructor(private readonly repository: TournamentParticipantRepository) {}

  /**
   * トーナメント参加者の登録
   * @param tournamentParticipant 登録/更新するトーナメント参加者情報
   * @returns 保存されたトーナメント参加者
   */
  async register(tournamentParticipant: TournamentParticipant): Promise<TournamentParticipant> {
    const existing = await this.repository.findByTournamentAndParticipant(
      tournamentParticipant.tournamentId,
      tournamentParticipant.participantId
    );

    // 既存のエントリがある場合エラー、なければ新規作成
    if (existing) {
      throw new Error('既に登録されている参加者です');
    }
    // 新規作成
    return await this.repository.save(tournamentParticipant);
  }

  /**
   * 特定のトーナメントとIDで参加者のキャプテン状態を切り替える
   * @param tournamentId トーナメントID
   * @param participantId 参加者ID
   * @returns 更新された参加者情報
   */
  async toggleCaptainStatus(
    tournamentId: TournamentId,
    participantId: ParticipantId
  ): Promise<TournamentParticipant> {
    // 指定された参加者を取得
    const participant = await this.repository.findByTournamentAndParticipant(
      tournamentId,
      participantId
    );
    if (!participant) {
      throw new Error(
        `指定されたトーナメント(${tournamentId.value})と参加者(${participantId.value})の組み合わせが見つかりません`
      );
    }

    // キャプテン状態を反転させる
    participant.toggleCaptainFlag();
    // 保存して返却
    return await this.repository.save(participant);
  }
}
