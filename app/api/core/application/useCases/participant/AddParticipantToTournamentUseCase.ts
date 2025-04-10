import { Participant } from '../../../domain/entities/Participant';
import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';

export interface AddParticipantDTO {
  tournamentId: string;
  name: string;
  isCaptain: boolean;
}

// 出力DTOの型定義
interface ParticipantDTO {
  id: string;
  name: string;
  isCaptain: boolean;
  tournamentId: string;
  participantId: string;
  createdAt: string;
}

export class AddParticipantToTournamentUseCase {
  constructor(
    private tournamentRepository: TournamentRepository,
    private participantRepository: ParticipantRepository
  ) {}

  async execute(input: AddParticipantDTO): Promise<ParticipantDTO> {
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
    if (tournament.draftStatus?.status === 'in_progress') {
      throw new Error('ドラフト進行中は参加者を追加できません');
    }

    // 参加者エンティティを作成
    const participantId = new ParticipantId(`participant-${Date.now()}`);
    const participant = new Participant(
      participantId,
      input.name.trim(),
      'default-weapon', // デフォルト値を設定
      0, // デフォルト経験値
      new Date(),
      input.isCaptain
    );

    // トーナメントに参加者を追加
    tournament.addParticipant(participant);
    await this.tournamentRepository.save(tournament);

    // 参加者データを保存
    await this.participantRepository.save(participant);

    // DTOを返却
    return {
      id: participant.id.value,
      name: participant.name,
      isCaptain: participant.isCaptain,
      tournamentId: tournament.id.value,
      participantId: participant.id.value,
      createdAt: participant.createdAt.toISOString(),
    };
  }
}
