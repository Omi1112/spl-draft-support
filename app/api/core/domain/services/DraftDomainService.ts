import { TournamentId } from '../valueObjects/TournamentId';
import { DraftRepository } from '../repositories/DraftRepository';
import { TeamRepository } from '../repositories/TeamRepository';
import { TournamentParticipantRepository } from '../repositories/TournamentParticipantRepository';
import { TournamentRepository } from '../repositories/TournamentRepository';
import { Team } from '../entities/Team'; // Team のインポートは startDraft 内で使うため残す

/**
 * ドラフトに関するドメインサービスの実装
 */
export class DraftDomainService {
  constructor(
    private readonly draftRepository: DraftRepository,
    private readonly teamRepository: TeamRepository,
    private readonly tournamentParticipantRepository: TournamentParticipantRepository,
    private readonly tournamentRepository: TournamentRepository
  ) {}

  /**
   * トーナメントのドラフト関連データをすべてリセット（削除して初期状態に戻す）
   * @param tournamentId リセット対象のトーナメントID
   * @returns リセット成功したかどうか
   */
  async resetDraft(tournamentId: TournamentId): Promise<boolean> {
    try {
      // 1. 対象トーナメントの全チームを取得
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        throw new Error('トーナメントが見つかりません');
      }

      // 2. トーナメントのチームを取得
      const teams = await this.teamRepository.findByTournamentId(tournamentId);

      // 3. 各チームに削除フラグを設定
      teams.forEach((team) => team.delete());

      // 4. 各チームを物理削除
      for (const team of teams) {
        await this.teamRepository.delete(team); // team.id ではなく team を渡す
      }

      // 5. トーナメントをリセット
      tournament.reset();
      await this.tournamentRepository.save(tournament);

      // 6. ドラフト履歴を削除
      await this.draftRepository.deleteByTournamentId(tournamentId);

      return true;
    } catch (error) {
      console.error('ドラフトリセットエラー:', error);
      throw new Error('ドラフトのリセットに失敗しました');
    }
  }

  /**
   * ドラフトを開始する
   * @param tournamentId 開始対象のトーナメントID
   * @returns Promise<void> - 成功時は void、失敗時は例外をスロー
   */
  async startDraft(tournamentId: TournamentId): Promise<void> {
    // 戻り値を Promise<void> に変更
    try {
      // 1. 対象トーナメントを取得
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        throw new Error('トーナメントが見つかりません');
      }

      // 2. キャプテン一覧を取得
      const tournamentParticipants =
        await this.tournamentParticipantRepository.findByTournamentId(tournamentId);
      const captains = tournamentParticipants.filter((tp) => tp.isCaptain);

      if (captains.length === 0) {
        throw new Error('トーナメントにキャプテンが登録されていません');
      }

      // 3. 各キャプテンごとにチームを作成（既に存在する場合は作成しない）
      for (const captain of captains) {
        // チームが既に存在するかチェック
        let team = await this.teamRepository.findByTournamentIdAndCaptainId(
          tournamentId,
          captain.participantId
        );

        // チームが存在しない場合は新規作成
        if (!team) {
          // キャプテンの名前をベースにチーム名を作成
          const teamName = `${captain.participantId.value}のチーム`;
          team = Team.create(teamName, captain.participantId, tournamentId);
          // save の戻り値を受け取らないように変更
          await this.teamRepository.save(team);

          // キャプテンにチームIDを割り当て
          captain.assignTeam(team.id);
          await this.tournamentParticipantRepository.save(captain);
        }
      }

      // 4. ドラフトステータスを更新（ラウンド1、ターン1で開始）
      tournament.startDraft();
      await this.tournamentRepository.save(tournament);

      // 戻り値を削除
    } catch (error) {
      console.error('ドラフト開始エラー:', error);
      throw new Error('ドラフトの開始に失敗しました');
    }
  }
}
