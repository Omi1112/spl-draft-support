// filepath: /workspace/app/api/core/application/useCases/participant/ToggleCaptainUseCase.ts
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentParticipantDomainService } from '../../../domain/services/TournamentParticipantDomainService';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
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
    private tournamentParticipantDomainService: TournamentParticipantDomainService
  ) {}

  async execute(input: ToggleCaptainInput): Promise<ToggleCaptainOutput> {
    // トーナメントの存在チェック
    const tournamentId = new TournamentId(input.tournamentId);
    const participantId = new ParticipantId(input.participantId);

    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error(`トーナメントID ${input.tournamentId} が見つかりません`);
    }

    // ドメインサービスを使用してキャプテン状態を切り替え
    const updatedParticipation = await this.tournamentParticipantDomainService.toggleCaptainStatus(
      tournamentId,
      participantId
    );

    // 結果を返す
    return {
      id: updatedParticipation.id.value,
      tournamentId: updatedParticipation.tournamentId.value,
      participantId: updatedParticipation.participantId.value,
      isCaptain: updatedParticipation.isCaptain,
    };
  }
}
