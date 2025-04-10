import { Participant } from '../../../domain/entities/Participant';
import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { CreateParticipantDTO, ParticipantDTO } from '../../interfaces/DTOs';

export class AddParticipantUseCase {
  constructor(
    private participantRepository: ParticipantRepository,
    private tournamentRepository: TournamentRepository
  ) {}

  async execute(dto: CreateParticipantDTO): Promise<ParticipantDTO | null> {
    // トーナメントが存在するか確認
    const tournamentId = new TournamentId(dto.tournamentId);
    const tournament = await this.tournamentRepository.findById(tournamentId);

    if (!tournament) {
      return null;
    }

    // 参加者エンティティを作成
    const id = `participant-${Date.now()}`;
    const participantId = new ParticipantId(id);

    const participant = new Participant(
      participantId,
      dto.name,
      dto.weapon,
      dto.xp,
      new Date(),
      dto.isCaptain || false
    );

    // 参加者を保存
    const savedParticipant = await this.participantRepository.save(participant);

    // トーナメントに参加者を追加
    tournament.addParticipant(savedParticipant);
    await this.tournamentRepository.save(tournament);

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
