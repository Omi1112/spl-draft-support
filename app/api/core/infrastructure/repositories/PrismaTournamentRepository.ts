import { PrismaClient } from '@prisma/client';
import { injectable } from 'tsyringe'; // 追加

import { Tournament } from '../../domain/entities/Tournament';
import { TournamentRepository } from '../../domain/repositories/TournamentRepository';
import { DraftStatus } from '../../domain/valueObjects/DraftStatus';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { prisma } from '../persistence/prisma/client';

@injectable() // 追加
export class PrismaTournamentRepository implements TournamentRepository {
  private prismaClient: PrismaClient = prisma; // 直接初期化

  /**
   * プリズマのデータをドメインエンティティに変換する
   * @param tournamentData Prismaから取得したトーナメントデータ
   * @returns ドメインエンティティ
   */
  private mapToDomainEntity(tournamentData: { [key: string]: unknown }): Tournament {
    return Tournament.reconstruct(
      tournamentData.id as string,
      tournamentData.name as string,
      tournamentData.createdAt as Date,
      DraftStatus.reconstruct(
        (tournamentData.draftStatus as { round: number }).round,
        (tournamentData.draftStatus as { turn: number }).turn,
        (tournamentData.draftStatus as { isActive: boolean }).isActive
      )
    );
  }

  async findAll(): Promise<Tournament[]> {
    const tournaments = await this.prismaClient.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        draftStatus: true,
      },
    });

    return tournaments.map((t) => this.mapToDomainEntity(t));
  }

  async findById(id: TournamentId): Promise<Tournament | null> {
    const tournamentData = await this.prismaClient.tournament.findUnique({
      where: { id: id.value },
      include: {
        participations: true,
        teams: true,
        draftStatus: true,
      },
    });

    if (!tournamentData) {
      return null;
    }

    return this.mapToDomainEntity(tournamentData);
  }

  async save(tournament: Tournament): Promise<Tournament> {
    // トーナメント情報の更新または作成
    const existingTournament = await this.prismaClient.tournament.findUnique({
      where: { id: tournament.id.value },
    });

    if (existingTournament) {
      // 既存のトーナメントを更新
      await this.prismaClient.tournament.update({
        where: { id: tournament.id.value },
        data: {
          name: tournament.nameValue,
        },
      });
    } else {
      // 新しいトーナメントを作成
      await this.prismaClient.tournament.create({
        data: {
          id: tournament.id.value,
          name: tournament.nameValue,
          createdAt: tournament.createdAt,
        },
      });
    }

    // ドラフトステータスの更新または作成
    if (tournament.draftStatus) {
      const draftStatus = tournament.draftStatus;
      const existingDraftStatus = await this.prismaClient.draftStatus.findUnique({
        where: { tournamentId: tournament.id.value },
      });

      if (existingDraftStatus) {
        // 既存のドラフトステータスを更新
        await this.prismaClient.draftStatus.update({
          where: { tournamentId: tournament.id.value },
          data: {
            round: draftStatus.round,
            turn: draftStatus.turn,
            isActive: draftStatus.isActive,
          },
        });
      } else {
        // 新しいドラフトステータスを作成
        await this.prismaClient.draftStatus.create({
          data: {
            tournamentId: tournament.id.value,
            round: draftStatus.round,
            turn: draftStatus.turn,
            isActive: draftStatus.isActive,
          },
        });
      }
    }

    return tournament;
  }

  async delete(id: TournamentId): Promise<void> {
    // 関連するドラフトステータスも削除される（カスケード設定による）
    await this.prismaClient.tournament.delete({
      where: { id: id.value },
    });
  }
}
