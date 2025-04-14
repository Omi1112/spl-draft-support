// filepath: /workspace/app/api/core/infrastructure/repositories/PrismaTournamentParticipantRepository.ts
import { TournamentParticipantRepository } from '../../domain/repositories/TournamentParticipantRepository';
import { TournamentParticipant } from '../../domain/entities/TournamentParticipant';
import { TournamentParticipantId } from '../../domain/valueObjects/TournamentParticipantId';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { ParticipantId } from '../../domain/valueObjects/ParticipantId';
import { prisma } from '../persistence/prisma/client';

export class PrismaTournamentParticipantRepository implements TournamentParticipantRepository {
  async findByTournamentAndParticipant(
    tournamentId: TournamentId,
    participantId: ParticipantId
  ): Promise<TournamentParticipant | null> {
    const tournamentParticipant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_participantId: {
          tournamentId: tournamentId.value,
          participantId: participantId.value,
        },
      },
    });

    if (!tournamentParticipant) {
      return null;
    }

    return this.mapToDomainEntity(tournamentParticipant);
  }

  async findById(id: TournamentParticipantId): Promise<TournamentParticipant | null> {
    const tournamentParticipant = await prisma.tournamentParticipant.findUnique({
      where: {
        id: id.value,
      },
    });

    if (!tournamentParticipant) {
      return null;
    }

    return this.mapToDomainEntity(tournamentParticipant);
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<TournamentParticipant[]> {
    const tournamentParticipants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId: tournamentId.value,
      },
    });

    return tournamentParticipants.map((tp) => this.mapToDomainEntity(tp));
  }

  async save(tournamentParticipant: TournamentParticipant): Promise<TournamentParticipant> {
    try {
      // データベース上で既に存在するかをチェック
      const existing = await prisma.tournamentParticipant.findUnique({
        where: {
          tournamentId_participantId: {
            tournamentId: tournamentParticipant.tournamentId.value,
            participantId: tournamentParticipant.participantId.value,
          },
        },
      });

      let result;

      if (existing) {
        // 更新処理
        result = await prisma.tournamentParticipant.update({
          where: { id: existing.id },
          data: {
            isCaptain: tournamentParticipant.isCaptain,
            teamId: tournamentParticipant.teamId?.value || null,
          },
        });
      } else {
        // 新規作成処理
        result = await prisma.tournamentParticipant.create({
          data: {
            id: tournamentParticipant.id.value,
            tournamentId: tournamentParticipant.tournamentId.value,
            participantId: tournamentParticipant.participantId.value,
            isCaptain: tournamentParticipant.isCaptain,
            teamId: tournamentParticipant.teamId?.value || null,
            createdAt: tournamentParticipant.createdAt,
          },
        });
      }

      return this.mapToDomainEntity(result);
    } catch (error) {
      console.error(`TournamentParticipantの保存中にエラーが発生しました: ${error}`);
      throw error;
    }
  }
  async delete(id: TournamentParticipantId): Promise<void> {
    await prisma.tournamentParticipant.delete({
      where: {
        id: id.value,
      },
    });
  }

  /**
   * トーナメントに所属する全参加者のチーム参照をクリア
   * @param tournamentId トーナメントID
   */
  async clearTeamReferences(tournamentId: TournamentId): Promise<void> {
    await prisma.tournamentParticipant.updateMany({
      where: { tournamentId: tournamentId.value },
      data: { teamId: null },
    });
  }

  /**
   * データベースから取得したデータをドメインエンティティに変換する
   * @param data データベースから取得したデータ
   * @returns ドメインエンティティ
   */
  private mapToDomainEntity(data: {
    id: string;
    tournamentId: string;
    participantId: string;
    isCaptain: boolean;
    teamId: string | null;
    createdAt: Date;
  }): TournamentParticipant {
    return TournamentParticipant.reconstruct(
      data.id,
      data.tournamentId,
      data.participantId,
      data.isCaptain,
      data.teamId,
      data.createdAt
    );
  }
}
