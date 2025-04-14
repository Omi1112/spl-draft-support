import { Team } from '../entities/Team';
import { ParticipantId } from '../valueObjects/ParticipantId';
import { TeamId } from '../valueObjects/TeamId';
import { TournamentId } from '../valueObjects/TournamentId';

export interface TeamRepository {
  findById(id: TeamId): Promise<Team | null>;
  findByTournamentId(tournamentId: TournamentId): Promise<Team[]>;
  findByCaptainId(captainId: ParticipantId): Promise<Team | null>;
  save(team: Team): Promise<Team>;
  delete(team: Team): Promise<void>; // 引数を TeamId から Team に変更

  /**
   * トーナメントIDに紐づくすべてのチームを削除
   * @param tournamentId 対象のトーナメントID
   */
  deleteByTournamentId(tournamentId: TournamentId): Promise<void>;

  /**
   * トーナメントIDとキャプテンIDに紐づくチームを検索
   * @param tournamentId 対象のトーナメントID
   * @param captainId 対象のキャプテンID
   * @returns 見つかったチーム、見つからない場合はnull
   */
  findByTournamentIdAndCaptainId(
    tournamentId: TournamentId,
    captainId?: ParticipantId
  ): Promise<Team | null>;
}
