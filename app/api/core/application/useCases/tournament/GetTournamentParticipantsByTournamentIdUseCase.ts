import { ParticipantRepository } from '../../../domain/repositories/ParticipantRepository';
import { TournamentParticipantRepository } from '../../../domain/repositories/TournamentParticipantRepository';
import { ParticipantId } from '../../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../../domain/valueObjects/TournamentId';

// 出力型定義
export interface TournamentParticipantDTO {
  tournamentId: string;
  participantId: string;
  isCaptain: boolean;
  createdAt: string;
  participant?: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
    createdAt: string;
  };
}

export class GetTournamentParticipantsByTournamentIdUseCase {
  constructor(
    private readonly tournamentParticipantRepository: TournamentParticipantRepository,
    private readonly participantRepository: ParticipantRepository
  ) {}

  async execute(tournamentId: string): Promise<TournamentParticipantDTO[]> {
    // 入力値のバリデーション
    if (!tournamentId) {
      throw new Error('トーナメントIDは必須です');
    }

    // トーナメント参加者を取得
    const tournamentIdObj = new TournamentId(tournamentId);
    const tournamentParticipants =
      await this.tournamentParticipantRepository.findByTournamentId(tournamentIdObj);

    // トーナメント参加者が見つからない場合は空配列を返す
    if (!tournamentParticipants || tournamentParticipants.length === 0) {
      return [];
    }

    // 各トーナメント参加者について、参加者情報を取得してDTOに変換
    const result = await Promise.all(
      tournamentParticipants.map(async (tp) => {
        const participant = await this.participantRepository.findById(tp.participantId);

        // 基本データを作成
        const dto: TournamentParticipantDTO = {
          tournamentId: tp.tournamentId.value,
          participantId: tp.participantId.value,
          isCaptain: tp.isCaptain,
          createdAt: tp.createdAt.toISOString(),
        };

        // 参加者情報が存在する場合は追加
        if (participant) {
          dto.participant = {
            id: participant.id.value,
            name: participant.name,
            weapon: participant.weapon,
            xp: participant.xp,
            createdAt: participant.createdAt.toISOString(),
          };
        }

        return dto;
      })
    );

    return result;
  }
}
