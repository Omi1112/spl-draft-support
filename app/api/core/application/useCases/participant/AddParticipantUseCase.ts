import { Participant } from '../../../domain/entities/Participant';
import { TournamentParticipant } from '../../../domain/entities/TournamentParticipant';
import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TournamentParticipantRepository } from '../../../domain/repositories/TournamentParticipantRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { CreateParticipantDTO, ParticipantDTO } from '../../interfaces/DTOs';

export class AddParticipantUseCase {
  constructor(
    private participantRepository: ParticipantRepository,
    private tournamentRepository: TournamentRepository,
    private tournamentParticipantRepository: TournamentParticipantRepository
  ) {}

  async execute(dto: CreateParticipantDTO): Promise<ParticipantDTO | null> {
    // トーナメントが存在するか確認
    const tournamentId = new TournamentId(dto.tournamentId);
    const tournament = await this.tournamentRepository.findById(tournamentId);

    if (!tournament) {
      return null;
    }

    // privateコンストラクタではなく、createメソッドを使用
    const participant = Participant.create(dto.name, dto.weapon, dto.xp, dto.isCaptain || false);

    // 参加者を保存
    const savedParticipant = await this.participantRepository.save(participant);

    // トーナメント参加者の関連を作成して保存
    const tournamentParticipant = TournamentParticipant.create(
      tournamentId,
      savedParticipant.id,
      savedParticipant.isCaptain
    );

    await this.tournamentParticipantRepository.save(tournamentParticipant);

    // DTOに変換して返却
    return {
      id: savedParticipant.id.value,
      name: savedParticipant.name,
      weapon: savedParticipant.weapon,
      xp: savedParticipant.xp,
      createdAt: savedParticipant.createdAt.toISOString(),
      isCaptain: savedParticipant.isCaptain,
    };
  }
}
