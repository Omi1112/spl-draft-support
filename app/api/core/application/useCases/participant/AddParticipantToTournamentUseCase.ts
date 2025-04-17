import { Participant } from '../../../domain/entities/Participant';
import { TournamentParticipant } from '../../../domain/entities/TournamentParticipant';
import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TournamentParticipantRepository } from '../../../domain/repositories/TournamentParticipantRepository';
import { TournamentRepository } from '../../../domain/repositories/TournamentRepository';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';

export interface AddParticipantDTO {
  tournamentId: string;
  name: string;
  weapon: string; // 武器を追加
  xp: number; // XPを追加
  isCaptain: boolean;
}

export interface TournamentParticipantDTO {
  id: string;
  tournamentId: string;
  participantId: string;
  createdAt: string;
  isCaptain: boolean;
  tournament: {
    id: string;
    name: string;
    createdAt: string;
  };
  participant: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
    createdAt: string;
    isCaptain: boolean;
  };
}

export class AddParticipantToTournamentUseCase {
  constructor(
    private tournamentRepository: TournamentRepository,
    private participantRepository: ParticipantRepository,
    private tournamentParticipantRepository: TournamentParticipantRepository
  ) {}

  async execute(input: AddParticipantDTO): Promise<TournamentParticipantDTO> {
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
      input.xp || 0 // クライアントから送信されたxpを使用、なければデフォルト値
    );

    // 参加者データを保存
    await this.participantRepository.save(participant);

    // TournamentParticipantエンティティを作成して保存する
    const tournamentParticipant = TournamentParticipant.create(
      tournamentId,
      participant.id,
      input.isCaptain || false
    );

    // TournamentParticipantRepositoryを使ってデータを保存
    await this.tournamentParticipantRepository.save(tournamentParticipant);

    // TournamentParticipantDTO型で返却
    return {
      id: tournamentParticipant.id.value,
      tournament: {
        id: tournament.id.value,
        name: tournament.name,
        createdAt: tournament.createdAt.toISOString(),
      },
      participant: {
        id: participant.id.value,
        name: participant.name,
        weapon: participant.weapon,
        xp: participant.xp,
        createdAt: participant.createdAt.toISOString(),
        isCaptain: input.isCaptain || false,
      },
      isCaptain: input.isCaptain || false,
      createdAt: tournamentParticipant.createdAt.toISOString(),
      tournamentId: tournament.id.value,
      participantId: participant.id.value,
    };
  }
}
