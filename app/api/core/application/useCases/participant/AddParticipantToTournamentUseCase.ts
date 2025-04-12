import { Participant } from '../../../domain/entities/Participant';
import { TournamentParticipant } from '../../../domain/entities/TournamentParticipant';
import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentParticipantRepository } from '../../../domain/repositories/TournamentParticipantRepository';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';

export interface AddParticipantDTO {
  tournamentId: string;
  name: string;
  weapon: string; // 武器を追加
  xp: number; // XPを追加
  isCaptain: boolean;
}

// 出力DTOの型定義
interface ParticipantDTO {
  id: string;
  name: string;
  tournamentId: string;
  participantId: string;
  createdAt: string;
}

export class AddParticipantToTournamentUseCase {
  constructor(
    private tournamentRepository: TournamentRepository,
    private participantRepository: ParticipantRepository,
    private tournamentParticipantRepository: TournamentParticipantRepository
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
      input.weapon || 'default-weapon', // クライアントから送信されたweaponを使用、なければデフォルト値
      input.xp || 0, // クライアントから送信されたxpを使用、なければデフォルト値
      new Date()
    );

    // 参加者データを保存
    await this.participantRepository.save(participant);

    // TournamentParticipantエンティティを作成して保存する
    // コンストラクタに必要なパラメータを確認
    const tournamentParticipant = TournamentParticipant.create(
      tournamentId,
      participantId,
      input.isCaptain
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
    };
  }
}
