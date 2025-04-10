// filepath: /workspace/app/api/core/application/useCases/participant/ToggleCaptainUseCase.ts
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentParticipantRepository } from '../../../domain/repositories/TournamentParticipantRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';

interface ToggleCaptainInput {
  tournamentId: string;
  participantId: string;
}

interface ToggleCaptainOutput {
  id: string;
  tournamentId: string;
  participantId: string;
  isCaptain: boolean;
}

export class ToggleCaptainUseCase {
  constructor(
    private tournamentRepository: TournamentRepository,
    private tournamentParticipantRepository: TournamentParticipantRepository
  ) {}

  async execute(input: ToggleCaptainInput): Promise<ToggleCaptainOutput> {
    // トーナメントと参加者の存在チェック
    const tournament = await this.tournamentRepository.findById(
      new TournamentId(input.tournamentId)
    );
    if (!tournament) {
      throw new Error(`トーナメントID ${input.tournamentId} が見つかりません`);
    }

    // 現在の参加情報を取得
    const currentParticipation =
      await this.tournamentParticipantRepository.findByTournamentAndParticipant(
        input.tournamentId,
        input.participantId
      );

    if (!currentParticipation) {
      throw new Error(
        `参加者ID ${input.participantId} はトーナメント ${input.tournamentId} に存在しません`
      );
    }

    // キャプテン設定を反転
    const shouldBeCaptain = !currentParticipation.isCaptain;

    // 更新
    const updatedParticipation = await this.tournamentParticipantRepository.update(
      input.tournamentId,
      input.participantId,
      { isCaptain: shouldBeCaptain }
    );

    // 結果を返す
    return {
      id: updatedParticipation.id,
      tournamentId: updatedParticipation.tournamentId,
      participantId: updatedParticipation.participantId,
      isCaptain: updatedParticipation.isCaptain,
    };
  }
}
