import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { DraftStatus } from '../../../domain/valueObjects/DraftStatus';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { DraftStatusDTO, UpdateDraftStatusDTO } from '../../interfaces/DTOs';

export class UpdateDraftStatusUseCase {
  constructor(private tournamentRepository: TournamentRepository) {}

  async execute(dto: UpdateDraftStatusDTO): Promise<DraftStatusDTO | null> {
    // トーナメントを取得
    const tournamentId = new TournamentId(dto.tournamentId);
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      return null;
    }

    // ドラフトステータスを更新
    const newDraftStatus = new DraftStatus(dto.round, dto.turn, dto.status);
    tournament.updateDraftStatus(newDraftStatus);

    // トーナメントを保存
    await this.tournamentRepository.save(tournament);

    // DTOに変換して返却
    return {
      round: newDraftStatus.round,
      turn: newDraftStatus.turn,
      status: newDraftStatus.status,
    };
  }
}
