import { Team } from '../../../domain/entities/Team';
import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TeamRepository } from '../../../domain/repositories/TeamRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
import { TeamId } from '../../../domain/valueObjects/TeamId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { CreateTeamDTO, TeamDTO } from '../../interfaces/DTOs';

export class CreateTeamUseCase {
  constructor(
    private teamRepository: TeamRepository,
    private participantRepository: ParticipantRepository,
    private tournamentRepository: TournamentRepository
  ) {}

  async execute(dto: CreateTeamDTO): Promise<TeamDTO | null> {
    // トーナメントの確認
    const tournamentId = new TournamentId(dto.tournamentId);
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      return null;
    }

    // キャプテンの確認
    const captainId = new ParticipantId(dto.captainId);
    const captain = await this.participantRepository.findById(captainId);
    if (!captain || !captain.isCaptain) {
      return null;
    }

    // チームエンティティの作成
    const id = `team-${Date.now()}`;
    const teamId = new TeamId(id);

    const team = new Team(
      teamId,
      dto.name,
      captainId,
      [captainId] // キャプテンを最初のメンバーとして追加
    );

    // チームを保存
    const savedTeam = await this.teamRepository.save(team);

    // キャプテンにチームを設定
    captain.assignToTeam(savedTeam);
    await this.participantRepository.save(captain);

    // トーナメントにチームを追加
    tournament.addTeam(savedTeam);
    await this.tournamentRepository.save(tournament);

    // DTOに変換して返却
    return {
      id: savedTeam.id.value,
      name: savedTeam.name,
      captainId: savedTeam.captainId.value,
      memberIds: savedTeam.memberIds.map((id) => id.value),
    };
  }
}
