import { Participant } from '../../../domain/entities/Participant';
import { TournamentParticipant } from '../../../domain/entities/TournamentParticipant';
import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentParticipantRepository } from '../../../domain/repositories/TournamentParticipantRepository';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';
import { ParticipantDTO } from '../../interfaces/DTOs';

export interface AddParticipantDTO {
  tournamentId: string;
  name: string;
  weapon: string; // 武器を追加
  xp: number; // XPを追加
  isCaptain: boolean;
}

// 出力用のDTOインターフェース
interface OutputParticipantDTO {
  id: string;
  name: string;
  tournamentId: string;
  participantId: string;
  createdAt: string;
  isCaptain: boolean;
}

export class AddParticipantToTournamentUseCase {
  constructor(
    private tournamentRepository: TournamentRepository,
    private participantRepository: ParticipantRepository,
    private tournamentParticipantRepository: TournamentParticipantRepository
  ) {}

  async execute(input: AddParticipantDTO): Promise<OutputParticipantDTO> {
    // 入力値のバリデーション
    if (!input.name || input.name.trim() === '') {
      throw new Error('参加者名は必須です');
    }

    // トーナメントの存在確認
    const tournamentId = new TournamentId(input.tournamentId);
    const tournament = await this.tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new Error('指定されたトーナメントが見つかりません');
    }

    // ドラフト中の場合は参加者を追加できない
    if (tournament.draftStatus?.isActive) {
      throw new Error('ドラフト進行中は参加者を追加できません');
    }

    // 参加者エンティティを作成
    const participant = Participant.create(
      input.name.trim(),
      input.weapon || 'default-weapon', // クライアントから送信されたweaponを使用、なければデフォルト値
      input.xp || 0, // クライアントから送信されたxpを使用、なければデフォルト値
      input.isCaptain || false
    );

    // 参加者データを保存
    await this.participantRepository.save(participant);

    // トーナメントに参加者を追加
    tournament.addParticipant(participant);
    await this.tournamentRepository.save(tournament);

    // TournamentParticipantエンティティを作成して保存する
    const tournamentParticipant = TournamentParticipant.create(
      tournamentId,
      participant.id,
      input.isCaptain || false
    );

    // TournamentParticipantRepositoryを使ってデータを保存
    await this.tournamentParticipantRepository.save(tournamentParticipant);

    // DTOを返却
    return {
      id: participant.id.value,
      name: participant.name,
      tournamentId: tournament.id.value,
      participantId: participant.id.value,
      createdAt: participant.createdAt.toISOString(),
      isCaptain: input.isCaptain || false,
    };
  }
}
